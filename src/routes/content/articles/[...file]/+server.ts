import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    // Handle both single files and nested paths
    const filePath = params.file.endsWith('.md') 
      ? path.join(process.cwd(), 'content/articles', params.file)
      : path.join(process.cwd(), 'content/articles', `${params.file}.md`);
    
    // Security check to prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const contentDir = path.normalize(path.join(process.cwd(), 'content/articles'));
    
    if (!normalizedPath.startsWith(contentDir)) {
      throw error(403, 'Access denied');
    }
    
    if (!fs.existsSync(normalizedPath)) {
      throw error(404, 'File not found');
    }
    
    const content = fs.readFileSync(normalizedPath, 'utf-8');
    
    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600' // 1 hour cache
      }
    });
  } catch (err) {
    console.error('Error serving markdown file:', err);
    throw error(500, 'Server error');
  }
}
