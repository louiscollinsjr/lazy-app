import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

type Article = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  content: string;
  author?: string;
  original_title?: string;
};

const CATEGORIES = [
  'Investing',
  'Online Business',
  'Physical Asset Monetization',
  'Digital Asset Monetization',
  'AI-Specific Methods',
  'Conceptual & Mindset',
  'Freelancing & Gigs'
];

const LM_STUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const CATEGORY_ANALYSIS_PROMPT = (title: string, description: string) => `
Analyze this article and select the most appropriate category:

Title: ${title}
Description: ${description}

Available Categories:
1. Investing
2. Online Business
3. Physical Asset Monetization
4. Digital Asset Monetization
5. AI-Specific Methods
6. Conceptual & Mindset
7. Freelancing & Gigs

Respond ONLY with the exact category name that best fits.`;

const TAG_PROMPT = (category: string, description: string) => `
Suggest 3-5 relevant tags for:
Category: ${category}
Description: ${description}

Respond ONLY with comma-separated tags.`;

const DESCRIPTION_PROMPT = (currentDesc: string) => `
Optimize this article description for SEO (150-160 characters):
"${currentDesc}"

Respond ONLY with the optimized description.`;

const TITLE_OPTIMIZATION_PROMPT = (currentTitle: string, description: string) => `
As we're refreshing content for LazyMoney, suggest new title options that:
1. Emphasize passive income and simplicity
2. Highlight high returns with minimal effort
3. Appeal to financial freedom desires
4. Use conversational yet engaging language

Current Title: ${currentTitle}
Description: ${description}

Respond ONLY with the single best improved title.`;

const UPDATE_TITLES = false;

// Add debug logging for directory resolution
console.log(`🔍 Checking for articles in: ${ARTICLES_DIR}`);

const getArticlesDir = () => {
  const possiblePaths = [
    path.join(process.cwd(), 'content/articles'),
    path.join(process.cwd(), 'static/content/articles')
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      console.log(`✅ Found articles directory: ${dir}`);
      return dir;
    }
  }

  console.warn(`⚠️  No articles directory found, defaulting to: ${ARTICLES_DIR}`);
  return ARTICLES_DIR;
};

async function processArticle(filePath: string, dryRun = false) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent.trim()) {
      console.warn(`⚠️  Empty file: ${path.basename(filePath)}`);
      return;
    }
    const { data: frontmatter, content = '' } = matter(fileContent);
    const article: Article = { 
      ...frontmatter, 
      content: content || '' 
    };

    // Get best category from LM Studio
    const categoryResponse = await axios.post(LM_STUDIO_URL, {
      model: 'local-model',
      messages: [{
        role: 'user',
        content: CATEGORY_ANALYSIS_PROMPT(article.title, article.description)
      }],
      temperature: 0.3
    });

    const bestCategory = categoryResponse.data.choices[0].message.content.trim();
    
    // Get tags for the category
    const tagResponse = await axios.post(LM_STUDIO_URL, {
      model: 'local-model',
      messages: [{
        role: 'user',
        content: TAG_PROMPT(bestCategory, article.description)
      }],
      temperature: 0.7
    });

    const suggestedTags = tagResponse.data.choices[0].message.content
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .map(tag => tag.replace(/[.,;:]$/, '')) // Remove trailing punctuation
      .filter(tag => tag.length > 0);

    // Optimize title
    const titleResponse = await axios.post(LM_STUDIO_URL, {
      model: 'local-model',
      messages: [{
        role: 'user',
        content: TITLE_OPTIMIZATION_PROMPT(article.title, article.description)
      }],
      temperature: 0.6
    });
    
    const optimizedTitle = titleResponse.data.choices[0].message.content.trim();

    // Optimize description
    const descResponse = await axios.post(LM_STUDIO_URL, {
      model: 'local-model',
      messages: [{
        role: 'user',
        content: DESCRIPTION_PROMPT(article.description)
      }],
      temperature: 0.5
    });
    
    const optimizedDesc = descResponse.data.choices[0].message.content.trim();

    // Prepare updated article
    const titleUpdates = {
      ...(UPDATE_TITLES ? {
        title: optimizedTitle,
        original_title: article.title
      } : {})
    };

    const updatedArticle = {
      ...article,
      ...titleUpdates,
      category: bestCategory,
      tags: suggestedTags,
      author: 'LazyMoney Team', // Set consistent author
      description: optimizedDesc
    };

    if (!dryRun) {
      // Update local file
      const updatedContent = matter.stringify(updatedArticle.content || '', {
        ...Object.fromEntries(
          Object.entries(updatedArticle)
            .filter(([key]) => key !== 'content')
            .map(([key, val]) => [key, val || ''])
        )
      }, {
        delimiters: '---' // Use standard frontmatter delimiters
      });
      fs.writeFileSync(filePath, updatedContent);

      // Update Supabase
      if (article.id) {
        await supabase
          .from('articles')
          .update({
            category: updatedArticle.category,
            tags: updatedArticle.tags,
            author: updatedArticle.author,
            description: updatedArticle.description,
            title: updatedArticle.title,
            original_title: updatedArticle.original_title
          })
          .eq('id', article.id);
      }
    }

    return {
      file: path.basename(filePath),
      originalCategory: article.category,
      updatedCategory: bestCategory,
      tags: suggestedTags,
      updated: !dryRun
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Missing file: ${path.basename(filePath)} (${filePath})`);
    } else {
      console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
    return;
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const singleFile = process.argv[2] && !process.argv[2].startsWith('--');

  console.log(`🚀 Starting article processing (${dryRun ? 'DRY RUN' : 'LIVE'})`);

  try {
    const files = singleFile 
      ? [path.resolve(process.cwd(), process.argv[2])]
      : fs.readdirSync(getArticlesDir())
          .filter(file => file.endsWith('.md'))
          .map(file => path.join(getArticlesDir(), file));

    console.log(`📂 Processing ${files.length} articles\n`);

    for (const file of files) {
      const result = await processArticle(file, dryRun);
      
      if (!result) continue;

      if ('error' in result) {
        console.log(`❌ ${result.file}: ${result.error}`);
      } else {
        console.log(`✅ ${result.file}`);
        console.log(`   Category: ${result.originalCategory} → ${result.updatedCategory}`);
        console.log(`   Tags: ${result.tags.join(', ')}`);
        console.log(`   ${result.updated ? 'UPDATED' : 'DRY RUN'}\n`);
      }
    }

    console.log('🎉 All articles processed!');
  } catch (error) {
    console.error('❌ Script failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
