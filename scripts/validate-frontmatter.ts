import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const contentDir = path.join(__dirname, '../content/articles');

function processFiles() {
  const files = fs.readdirSync(contentDir);
  
  files.forEach(file => {
    if (!file.endsWith('.md')) return;
    
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ensure proper YAML dividers
    if (!content.startsWith('---\n')) {
      const newContent = '---\n' + content;
      fs.writeFileSync(filePath, newContent);
    }
    
    // Parse YAML to check title formatting
    const matter = require('gray-matter');
    const { data } = matter(content);
    
    if (data.title && data.title.includes(':') && !data.title.startsWith("'")) {
      const updatedContent = content.replace(
        `title: ${data.title}`,
        `title: '${data.title.replace(/'/g, "''")}'`
      );
      fs.writeFileSync(filePath, updatedContent);
    }
    
    // Ensure closing divider
    if (!content.includes('\n---\n')) {
      const updatedContent = content.replace(/\n---$/, '\n---\n') + '\n';
      fs.writeFileSync(filePath, updatedContent);
    }
  });
  
  console.log('Finished validating all markdown files');
}

processFiles();
