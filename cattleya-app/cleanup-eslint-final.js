const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/React files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to clean up a file
function cleanupFile(filePath) {
  console.log(`Cleaning up: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove unused imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
  const importMatches = content.match(importRegex) || [];
  
  for (const match of importMatches) {
    const importContent = match.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/);
    if (importContent) {
      const imports = importContent[1].split(',').map(i => i.trim());
      const source = importContent[2];
      
      // Check which imports are actually used
      const usedImports = imports.filter(imp => {
        const importName = imp.split(' as ')[0].trim();
        const regex = new RegExp(`\\b${importName}\\b`, 'g');
        const matches = content.match(regex) || [];
        return matches.length > 1; // More than just the import itself
      });
      
      if (usedImports.length !== imports.length) {
        if (usedImports.length === 0) {
          // Remove entire import if no imports are used
          content = content.replace(match, '');
        } else {
          // Replace with only used imports
          const newImport = `import { ${usedImports.join(', ')} } from '${source}';`;
          content = content.replace(match, newImport);
        }
        modified = true;
      }
    }
  }

  // Remove unused variables (simple cases)
  const unusedVarPatterns = [
    /const\s+(\w+)\s*=\s*useState\([^)]*\);\s*\/\/\s*unused/gi,
    /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*unused/gi,
    /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*never used/gi
  ];
  
  for (const pattern of unusedVarPatterns) {
    content = content.replace(pattern, '');
    modified = true;
  }

  // Fix unescaped quotes
  content = content.replace(/(?<=\s)'/g, '&apos;');
  content = content.replace(/(?<=\s)"/g, '&quot;');

  // Replace any with proper types where possible
  content = content.replace(/: any(?=\s*[,)])/g, ': unknown');
  content = content.replace(/: any(?=\s*[=])/g, ': unknown');

  // Remove empty lines at the end
  content = content.replace(/\n+$/, '\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findTsFiles(srcDir);

console.log(`Found ${files.length} TypeScript/React files to clean up...`);

for (const file of files) {
  try {
    cleanupFile(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log('Cleanup completed!'); 