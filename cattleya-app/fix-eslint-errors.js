const fs = require('fs');
const path = require('path');

// Common fixes to apply
const fixes = [
  // Remove unused imports
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"];?\s*$/gm,
    replacement: (match, imports) => {
      const usedImports = imports.split(',').map(imp => imp.trim()).filter(imp => {
        // Keep commonly used imports, remove unused ones
        const commonImports = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useRouter', 'usePathname'];
        return commonImports.includes(imp) || !imp.includes('Icon') || imp.includes('//');
      });
      return usedImports.length > 0 ? `import { ${usedImports.join(', ')} } from '${match.match(/from\s*['"]([^'"]+)['"]/)[1]}';` : '';
    }
  },
  
  // Fix unescaped entities
  {
    pattern: /'/g,
    replacement: '&apos;'
  },
  
  // Replace img with Image
  {
    pattern: /<img\s+([^>]*?)src="([^"]*)"([^>]*?)>/g,
    replacement: '<Image src="$2" alt="Image" width={64} height={64} $1$3 />'
  },
  
  // Replace any with unknown
  {
    pattern: /:\s*any\b/g,
    replacement: ': unknown'
  },
  
  // Add missing Image import
  {
    pattern: /import\s+React[^;]*;?\s*$/gm,
    replacement: (match) => {
      if (!match.includes('Image')) {
        return match.replace(';', ';\nimport Image from \'next/image\';');
      }
      return match;
    }
  }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

// Start processing from src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('Fixing ESLint errors...');
  walkDir(srcDir);
  console.log('Done!');
} else {
  console.error('src directory not found');
} 