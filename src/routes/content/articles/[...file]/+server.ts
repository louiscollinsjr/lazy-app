import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, request }) {
  // Log request details
  console.log('Content request received:', {
    url: request.url,
    params,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV
  });

  try {
    // Handle both single files and nested paths
    const requestedFile = params.file;
    console.log('Requested file:', requestedFile);
    
    const filePath = requestedFile.endsWith('.md') 
      ? path.join(process.cwd(), 'content/articles', requestedFile)
      : path.join(process.cwd(), 'content/articles', `${requestedFile}.md`);
    
    console.log('Attempting to access file at:', filePath);
    
    // Security check to prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const contentDir = path.normalize(path.join(process.cwd(), 'content/articles'));
    
    console.log('Path checks:', {
      normalizedPath,
      contentDir,
      isInContentDir: normalizedPath.startsWith(contentDir)
    });
    
    if (!normalizedPath.startsWith(contentDir)) {
      console.error('Security violation: Path outside content directory');
      throw error(403, 'Access denied');
    }
    
    // Check if file exists
    const fileExists = fs.existsSync(normalizedPath);
    console.log('File exists check:', {
      path: normalizedPath,
      exists: fileExists
    });
    
    if (!fileExists) {
      // Try to list available files for debugging
      try {
        const contentDirExists = fs.existsSync(contentDir);
        console.log('Content directory exists:', contentDirExists);
        
        if (contentDirExists) {
          const availableFiles = fs.readdirSync(contentDir);
          console.log('Available files in content directory:', availableFiles);
        } else {
          console.log('Content directory does not exist');
        }
      } catch (dirErr) {
        console.error('Error listing content directory:', dirErr);
      }
      
      throw error(404, `File not found: ${requestedFile}`);
    }
    
    // Read file content
    console.log('Reading file content...');
    const fileContent = fs.readFileSync(normalizedPath, 'utf-8');
    console.log('File content length:', fileContent.length);
    
    // Parse front matter and extract content only
    const { content } = matter(fileContent);
    console.log('Content after front matter removal:', content.length);
    
    console.log('Successfully serving markdown file');
    return new Response(content.trim(), {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600' // 1 hour cache
      }
    });
  } catch (err) {
    console.error('Error serving markdown file:', err);
    
    // Provide more detailed error information
    if (err.code === 'ENOENT') {
      console.error('File not found error (ENOENT)');
      return new Response(`File not found: ${params.file}`, { status: 404 });
    }
    
    if (err.status && err.body) {
      // This is an error thrown by the error() helper
      return new Response(err.body.message, { status: err.status });
    }
    
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}
