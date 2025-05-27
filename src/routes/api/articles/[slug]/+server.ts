import { error, json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    const slug = params.slug;
    
    // Security check to prevent directory traversal
    if (slug.includes('../') || slug.includes('..\\') || slug.includes('..')) {
      throw error(400, 'Invalid article request');
    }
    
    // Handle both with and without .md extension
    const articlePath = path.resolve(
      `content/articles/${slug.endsWith('.md') ? slug : `${slug}.md`}`
    );
    const contentDir = path.normalize(path.join(process.cwd(), 'content/articles'));
    
    if (!articlePath.startsWith(contentDir)) {
      throw error(403, 'Access denied');
    }
    
    if (!fs.existsSync(articlePath)) {
      throw error(404, 'Article not found');
    }
    
    const fileContent = fs.readFileSync(articlePath, 'utf-8');
    const { content } = matter(fileContent);
    
    return new Response(content.trim(), {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600' // 1 hour cache
      }
    });
  } catch (err) {
    console.error('Error loading article content:', err);
    if (err.status && err.body) {
      // This is an error thrown by the error() helper
      return new Response(err.body.message, { status: err.status });
    }
    return new Response('Error loading article content', { status: 500 });
  }
}
