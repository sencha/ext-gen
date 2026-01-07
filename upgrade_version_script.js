const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Default exclusions
const DEFAULT_EXCLUDE = [
  'node_modules',
  '.git',
  'build',
  '.cache',
  '.sencha',
  '.vscode'
];

// Binary file extensions to skip
const BINARY_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib',
  '.mp3', '.mp4', '.avi', '.mov',
  '.ttf', '.woff', '.woff2', '.eot',
  '.bin', '.dat', '.db'
];

async function getAllFiles(dirPath, excludePatterns = []) {
  let files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Check if should be excluded
      if (shouldExclude(entry.name, excludePatterns)) {
        console.log(`Skipping excluded: ${fullPath}`);
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively get files from subdirectory
        const subFiles = await getAllFiles(fullPath, excludePatterns);
        files = files.concat(subFiles);
      } else {
        // Check if it's a binary file
        const ext = path.extname(entry.name).toLowerCase();
        if (!BINARY_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        } else {
          console.log(`Skipping binary file: ${fullPath}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
  
  return files;
}

function shouldExclude(name, excludePatterns) {
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      // Simple wildcard matching
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(name);
    }
    return name === pattern || name.includes(pattern);
  });
}

async function replaceInFile(filePath, currentVersion, latestVersion) {
  try {
    // Read file content
    let content = await fs.readFile(filePath, 'utf8');
    
    // Check if file contains the current version
    if (!content.includes(currentVersion)) {
      return { replaced: false, occurrences: 0 };
    }
    
    // Count occurrences
    const occurrences = (content.match(new RegExp(escapeRegExp(currentVersion), 'g')) || []).length;
    
    // Replace all occurrences
    const newContent = content.split(currentVersion).join(latestVersion);
    
    // Write back to file
    await fs.writeFile(filePath, newContent, 'utf8');
    
    return { replaced: true, occurrences };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { replaced: false, occurrences: 0, error: error.message };
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  console.log('=== Version Replacement Tool ===\n');
  
  try {
    // Get current version
    const currentVersion = await question('Enter current version: ');
    if (!currentVersion.trim()) {
      console.log('Current version cannot be empty!');
      rl.close();
      return;
    }
    
    // Get latest version
    const latestVersion = await question('Enter latest version: ');
    if (!latestVersion.trim()) {
      console.log('Latest version cannot be empty!');
      rl.close();
      return;
    }
    
    // Get additional exclusions
    const additionalExclude = await question('Enter additional files/folders to exclude (comma-separated, or press Enter to skip): ');
    
    rl.close();
    
    // Parse exclusions
    const excludePatterns = [...DEFAULT_EXCLUDE];
    if (additionalExclude.trim()) {
      const additional = additionalExclude.split(',').map(s => s.trim()).filter(s => s);
      excludePatterns.push(...additional);
    }
    
    console.log('\n--- Configuration ---');
    console.log(`Current Version: ${currentVersion}`);
    console.log(`Latest Version: ${latestVersion}`);
    console.log(`Excluded patterns: ${excludePatterns.join(', ')}`);
    console.log('\n--- Starting replacement ---\n');
    
    // Get current directory
    const projectRoot = process.cwd();
    console.log(`Scanning directory: ${projectRoot}\n`);
    
    // Get all files
    const files = await getAllFiles(projectRoot, excludePatterns);
    console.log(`\nFound ${files.length} files to process\n`);
    
    // Process files
    let processedCount = 0;
    let replacedCount = 0;
    let totalOccurrences = 0;
    
    for (const file of files) {
      const relativePath = path.relative(projectRoot, file);
      const result = await replaceInFile(file, currentVersion, latestVersion);
      
      if (result.replaced) {
        console.log(`✓ ${relativePath} - Replaced ${result.occurrences} occurrence(s)`);
        replacedCount++;
        totalOccurrences += result.occurrences;
      }
      
      processedCount++;
    }
    
    // Summary
    console.log('\n--- Summary ---');
    console.log(`Files scanned: ${processedCount}`);
    console.log(`Files modified: ${replacedCount}`);
    console.log(`Total replacements: ${totalOccurrences}`);
    console.log(`\nVersion updated from ${currentVersion} to ${latestVersion}`);
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  }
}

main();
