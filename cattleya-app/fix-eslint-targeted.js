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

// Function to fix specific ESLint issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Replace <img> with <Image /> (only in JSX)
  if (content.includes('<img') && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
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
  
  // 2. Replace ': any' with ': unknown' (safer default)
  if (content.includes(': any')) {
    content = content.replace(/: any/g, ': unknown');
    modified = true;
  }
  
  // 3. Fix unescaped entities only in JSX text content (not in strings)
  // This is more complex, so we'll be more careful
  if (content.includes("'") || content.includes('"')) {
    // Only replace in JSX text content, not in JavaScript strings
    content = content.replace(/>([^<]*?)'([^<]*?)</g, (match, before, after) => {
      return `>${before}&apos;${after}<`;
    });
    content = content.replace(/>([^<]*?)"([^<]*?)</g, (match, before, after) => {
      return `>${before}&quot;${after}<`;
    });
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

// Main execution
console.log('Starting targeted ESLint fix...');

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

console.log('Targeted ESLint fix completed!'); 