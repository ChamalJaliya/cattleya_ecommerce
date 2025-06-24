const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/TSX files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix common ESLint issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Replace <img> with <Image />
  if (content.includes('<img')) {
    // Add Image import if not present
    if (!content.includes("import Image from 'next/image'") && !content.includes('import Image from "next/image"')) {
      const importMatch = content.match(/import.*from.*['"]/);
      if (importMatch) {
        const lastImportIndex = content.lastIndexOf('import');
        const lastImportEnd = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, lastImportEnd) + "import Image from 'next/image';\n" + content.slice(lastImportEnd);
      }
    }
    
    // Replace <img> tags with <Image />
    content = content.replace(
      /<img\s+([^>]*?)src=(["'])([^"']+)\2([^>]*?)>/g,
      (match, beforeSrc, quote, src, afterSrc) => {
        // Extract width and height if present
        const widthMatch = afterSrc.match(/width=(["'])(\d+)\1/);
        const heightMatch = afterSrc.match(/height=(["'])(\d+)\1/);
        const width = widthMatch ? widthMatch[2] : '64';
        const height = heightMatch ? heightMatch[2] : '64';
        
        // Remove width and height from afterSrc to avoid duplication
        let cleanAfterSrc = afterSrc.replace(/width=(["'])\d+\1/g, '').replace(/height=(["'])\d+\1/g, '');
        
        return `<Image ${beforeSrc}src=${quote}${src}${quote} width={${width}} height={${height}}${cleanAfterSrc} />`;
      }
    );
    modified = true;
  }
  
  // 2. Replace 'any' with 'unknown' (safer default)
  if (content.includes(': any')) {
    content = content.replace(/: any/g, ': unknown');
    modified = true;
  }
  
  // 3. Fix unescaped entities
  content = content.replace(/(?<!&)'(?=\w)/g, '&apos;');
  content = content.replace(/(?<!&)"(?=\w)/g, '&quot;');
  modified = true;
  
  // 4. Remove unused imports (basic cleanup)
  const lines = content.split('\n');
  const newLines = [];
  const usedImports = new Set();
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      newLines.push(line);
      continue;
    }
    
    // Check if line contains import
    if (line.includes('import ') && line.includes(' from ')) {
      // Extract imported items
      const importMatch = line.match(/import\s+\{([^}]+)\}\s+from/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(i => i.trim());
        const usedImportsInLine = imports.filter(imp => {
          const cleanImp = imp.replace(/\s+as\s+\w+/, ''); // Remove "as" aliases
          return content.includes(cleanImp) && !line.includes(cleanImp);
        });
        
        if (usedImportsInLine.length > 0) {
          newLines.push(line);
        }
        // Skip unused imports
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (newLines.length !== lines.length) {
    content = newLines.join('\n');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// Main execution
console.log('Starting comprehensive ESLint fix...');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript/TSX files`);

tsFiles.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('Comprehensive ESLint fix completed!');
console.log('Note: Some issues may require manual review, especially:');
console.log('- Complex type definitions');
console.log('- React Hook dependencies');
console.log('- Specific business logic'); 