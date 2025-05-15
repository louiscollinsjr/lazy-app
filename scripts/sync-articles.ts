#!/usr/bin/env bun
/**
 * Sync Markdown Frontmatter to Supabase
 * 
 * This script:
 * 1. Reads all .md files in content/articles/
 * 2. Parses the YAML frontmatter
 * 3. Extracts required fields
 * 4. Inserts/updates data in Supabase tables
 * 5. Updates markdown files with Supabase-generated IDs
 * 
 * Usage:
 *   bun run scripts/sync-articles.ts [--dry-run]
 *   bun run scripts/sync-articles.ts [--update-md-files]
 *   bun run scripts/sync-articles.ts [--generate-new-ids]
 *   bun run scripts/sync-articles.ts [--clean-frontmatter]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import slugify from 'slugify';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
import 'dotenv/config';

// Check for proper environment configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CLI options parsing
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const updateMdFiles = args.includes('--update-md-files');
const generateNewIds = args.includes('--generate-new-ids');
const cleanFrontmatter = args.includes('--clean-frontmatter');

// Article directory path
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

// Type definitions based on the schema
interface ArticleData {
  id?: string; // Optional now, as Supabase will generate it
  title: string;
  slug: string;
  description?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  published_date?: string;
  publishedDate?: string; // Alias for frontmatter
  author?: string;
  draft?: boolean;
}

interface FrontmatterData extends ArticleData {
  // Additional fields that might be in frontmatter but not in DB
  [key: string]: any;
}

interface ArticleSource {
  article_id: string; // This refers to the id field in the articles table
  filename: string;
  title?: string;
  summary?: string;
  url?: string;
}

/**
 * Process a single markdown file
 */
async function processFile(filePath: string): Promise<boolean> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatterData, content: articleContent } = matter(fileContent);
    const frontmatter: FrontmatterData = frontmatterData;
    
    // Extract required fields for the article
    const article: ArticleData = {
      title: frontmatter.title,
      // Generate slug from title if not provided
      slug: frontmatter.slug || slugify(frontmatter.title, { lower: true, strict: true }),
      description: frontmatter.description,
      featured_image: frontmatter.featured_image,
      category: frontmatter.category,
      tags: frontmatter.tags,
      published_date: frontmatter.publishedDate || frontmatter.published_date, // Handle both formats
      author: frontmatter.author,
      draft: frontmatter.draft !== undefined ? frontmatter.draft : false
    };

    // Only include existing ID if it exists in frontmatter and we're not generating new IDs
    if (!generateNewIds && !cleanFrontmatter) {
      if (frontmatter.id) {
        article.id = frontmatter.id;
      }
    }

    console.log(`Processing: ${path.basename(filePath)}`);
    console.log(`  Title: ${article.title}`);
    console.log(`  Slug: ${article.slug}`);
    
    if (isDryRun) {
      console.log('  [DRY RUN] Would upsert to Supabase');
      console.log('  Article data:', JSON.stringify(article, null, 2));
      if (frontmatter.sources && frontmatter.sources.length) {
        console.log(`  Sources (${frontmatter.sources.length}):`, JSON.stringify(frontmatter.sources, null, 2));
      }
      return true;
    }

    let dbId = frontmatter.id;
    let needsUpdate = false;

    // Check if the article exists by slug
    const { data: existingArticle, error: lookupError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', article.slug)
      .maybeSingle();

    if (lookupError) {
      console.error(`  Error looking up article by slug "${article.slug}":`, lookupError);
      return false;
    }

    // If article exists, use its ID unless we're generating new IDs
    // Otherwise let Supabase generate one
    if (existingArticle && !generateNewIds) {
      console.log(`  Found existing article with slug "${article.slug}"`);
      dbId = existingArticle.id;
      article.id = dbId;
      
      // Update via UPSERT
      const { error: updateError } = await supabase
        .from('articles')
        .upsert({
          ...article,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error(`  Error updating article "${article.title}":`, updateError);
        return false;
      }
      
      // Even if we're just updating, we want to clean the frontmatter if requested
      if (cleanFrontmatter) {
        needsUpdate = true;
      }
    } else {
      // For new articles or when generating new IDs
      if (generateNewIds && existingArticle) {
        // If we're generating new IDs, first delete the existing article
        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .eq('slug', article.slug);

        if (deleteError) {
          console.error(`  Error deleting existing article for regeneration "${article.title}":`, deleteError);
          return false;
        }
        console.log(`  Deleted existing article with slug "${article.slug}" for ID regeneration`);
      }
      
      // Generate new UUIDs in our script or clean frontmatter
      if (generateNewIds || cleanFrontmatter) {
        // Generate new UUID directly here
        article.id = uuidv4();
        needsUpdate = true;
        console.log(`  Generated new UUID for article`);
      } else if (!article.id) {
        article.id = uuidv4(); // Generate a temporary UUID
        needsUpdate = true;
      }

      // Insert new article
      const { data: newArticle, error: insertError } = await supabase
        .from('articles')
        .insert([
          {
            ...article,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id');

      if (insertError) {
        console.error(`  Error inserting article "${article.title}":`, insertError);
        return false;
      }

      if (newArticle && newArticle.length > 0) {
        dbId = newArticle[0].id;
        needsUpdate = true;
        console.log(`  Created new article with ID: ${dbId}`);
      }
    }

    // Process sources if they exist
    if (frontmatter.sources && frontmatter.sources.length > 0) {
      // Prepare sources array
      const sources: ArticleSource[] = frontmatter.sources.map((source: string) => ({
        article_id: dbId,
        filename: source
      }));

      // First delete existing sources for this article to avoid duplicates
      const { error: deleteError } = await supabase
        .from('article_sources')
        .delete()
        .eq('article_id', dbId);

      if (deleteError) {
        console.error(`  Error deleting existing sources for article "${article.title}":`, deleteError);
      }

      // Insert new sources
      const { error: sourcesError } = await supabase
        .from('article_sources')
        .insert(sources);

      if (sourcesError) {
        console.error(`  Error inserting sources for article "${article.title}":`, sourcesError);
        return false;
      }
    }

    // Update markdown file with generated ID if requested or forcing new IDs
    if ((updateMdFiles || generateNewIds || cleanFrontmatter) && needsUpdate && dbId) {
      try {
        // Create updated frontmatter
        let updatedFrontmatter = { ...frontmatter };
        
        if (cleanFrontmatter) {
          // Remove ID fields from frontmatter to let database generate them in the future
          const { id, article_id, ...cleanedFrontmatter } = updatedFrontmatter;
          updatedFrontmatter = cleanedFrontmatter;
          console.log(`  Cleaned frontmatter by removing ID fields`); 
        } else {
          // Just update the ID
          updatedFrontmatter.id = dbId;
          // Remove article_id as we're not using it anymore
          delete updatedFrontmatter.article_id;
        }
        
        const updatedFileContent = matter.stringify(articleContent, updatedFrontmatter);
        fs.writeFileSync(filePath, updatedFileContent);
        console.log(`  Updated markdown file format`);
      } catch (writeError) {
        console.error(`  Error updating markdown file:`, writeError);
        // Continue processing - this is not a critical error
      }
    }

    console.log(`  Success: Article "${article.title}" synced to Supabase`);
    return true;
  } catch (error) {
    console.error(`  Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all markdown files in the articles directory
 */
async function syncArticles() {
  console.log(`Starting sync process...${isDryRun ? ' (DRY RUN)' : ''}`);
  console.log(`Articles directory: ${ARTICLES_DIR}`);

  try {
    // Check if articles directory exists
    if (!fs.existsSync(ARTICLES_DIR)) {
      console.error(`Error: Articles directory does not exist: ${ARTICLES_DIR}`);
      process.exit(1);
    }

    // Get all markdown files
    const files = fs.readdirSync(ARTICLES_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(ARTICLES_DIR, file));

    console.log(`Found ${files.length} markdown files\n`);

    // Process files with batch support
    const BATCH_SIZE = 10; // Adjust based on Supabase limits
    const results: boolean[] = [];

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(file => processFile(file)));
      results.push(...batchResults);
    }

    // Summary
    const successCount = results.filter(Boolean).length;
    console.log(`\nSync complete!`);
    console.log(`Successfully processed ${successCount} of ${files.length} files`);
    
    if (successCount !== files.length) {
      console.log(`Failed to process ${files.length - successCount} files`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during sync:', error);
    process.exit(1);
  }
}

// Run the sync process
syncArticles();
