import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    const slug = params.slug;
    const articlePath = path.resolve(`content/articles/${slug}.md`);
    
    if (!fs.existsSync(articlePath)) {
      return new Response('Article not found', { status: 404 });
    }
    
    const fileContent = fs.readFileSync(articlePath, 'utf-8');
    const { content } = matter(fileContent);
    
    return new Response(content.trim(), {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error loading article content:', error);
    return new Response('Error loading article content', { status: 500 });
  }
}
