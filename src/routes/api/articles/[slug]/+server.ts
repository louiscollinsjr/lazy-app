// src/routes/api/articles/[slug]/+server.js

import { error } from '@sveltejs/kit';
// fs and path are no longer needed for reading these files
// import fs from 'fs';
// import path from 'path';
import matter from 'gray-matter';

// 1. Use import.meta.glob to get all markdown files
//    The paths will be relative to the project root, e.g., /content/articles/my-post.md
//    `eager: false` makes them dynamically imported (good for many files).
//    `as: 'raw'` imports the file content as a string.
const allArticleModules = import.meta.glob('/content/articles/**/*.md', {
  as: 'raw',
  eager: false // Set to true if you have very few articles and want them bundled upfront
});

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    const slug = params.slug;

    // Security check: Basic slug validation (optional, but good practice)
    // You might want a more robust regex depending on allowed slug characters.
    // This simple check for '..' is still good to prevent attempts to construct weird keys.
    if (slug.includes('..')) {
      console.warn(`Attempt to use '..' in slug: ${slug}`);
      throw error(400, 'Invalid article request: slug format incorrect.');
    }

    // 2. Construct the key that import.meta.glob would use.
    //    It expects paths starting from the project root.
    const requestedModulePath = `/content/articles/${slug.endsWith('.md') ? slug : `${slug}.md`}`;

    // 3. Check if the constructed path exists as a key in our imported modules
    if (!allArticleModules[requestedModulePath]) {
      console.warn(`Article not found. Looked for modulePath: "${requestedModulePath}".`);
      // For debugging, you can log available paths:
      // console.log('Available article module paths:', Object.keys(allArticleModules));
      throw error(404, 'Article not found');
    }

    // 4. Load the content
    //    If eager: false, allArticleModules[requestedModulePath] is a function
    //    that returns a Promise for the raw string content.
    const rawFileContent = await allArticleModules[requestedModulePath]();
    //    If eager: true, it would be:
    //    const rawFileContent = allArticleModules[requestedModulePath];

    // 5. Process with gray-matter (same as before)
    //    We rename 'content' from gray-matter to 'articleBody' to avoid confusion.
    const { content: articleBody, data: frontmatter } = matter(rawFileContent);

    // You can now also use 'frontmatter' if needed.

    return new Response(articleBody.trim(), {
      headers: {
        'Content-Type': 'text/markdown', // Or 'text/plain' if you prefer
        'Cache-Control': 'public, max-age=3600' // 1 hour cache
      }
    });

  } catch (err) {
    // Log the full error on the server for better debugging
    console.error('Error in API route /api/articles/[slug]:', err);

    // Handle SvelteKit's error() helper specifically
    if (err.status && err.body && typeof err.body.message === 'string') {
      return new Response(err.body.message, { status: err.status });
    }
    // Handle generic errors
    return new Response('Error loading article content', { status: 500 });
  }
}


// import { error, json } from '@sveltejs/kit';
// import fs from 'fs';
// import path from 'path';
// import matter from 'gray-matter';

// /** @type {import('./$types').RequestHandler} */
// export async function GET({ params }) {
//   try {
//     const slug = params.slug;
    
//     // Security check to prevent directory traversal
//     if (slug.includes('../') || slug.includes('..\\') || slug.includes('..')) {
//       throw error(400, 'Invalid article request');
//     }
    
//     // Handle both with and without .md extension
//     const articlePath = path.resolve(
//       `content/articles/${slug.endsWith('.md') ? slug : `${slug}.md`}`
//     );
//     const contentDir = path.normalize(path.join(process.cwd(), 'content/articles'));
    
//     if (!articlePath.startsWith(contentDir)) {
//       throw error(403, 'Access denied');
//     }
    
//     if (!fs.existsSync(articlePath)) {
//       throw error(404, 'Article not found');
//     }
    
//     const fileContent = fs.readFileSync(articlePath, 'utf-8');
//     const { content } = matter(fileContent);
    
//     return new Response(content.trim(), {
//       headers: {
//         'Content-Type': 'text/markdown',
//         'Cache-Control': 'public, max-age=3600' // 1 hour cache
//       }
//     });
//   } catch (err) {
//     console.error('Error loading article content:', err);
//     if (err.status && err.body) {
//       // This is an error thrown by the error() helper
//       return new Response(err.body.message, { status: err.status });
//     }
//     return new Response('Error loading article content', { status: 500 });
//   }
// }
