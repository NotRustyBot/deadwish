import * as fs from 'fs';
import * as path from 'path';

// Function to recursively scan directories and collect file paths
function scanDirectory(directory: string, basePath: string = ''): Record<string, string> {
  const result: Record<string, string> = {};
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    if (itemPath.endsWith('.css')) continue;

    if (stats.isDirectory()) {
      // If it's a directory, recursively scan it
      const nestedResults = scanDirectory(
        itemPath,
        path.join(basePath, item)
      );

      // Merge nested results into our result object
      Object.assign(result, nestedResults);
    } else {
      // If it's a file, add it to our results
      // Create the key by removing file extension and replacing any path separators with hyphens
      const relativePath = path.join(basePath, item);
      const key = relativePath
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .split(path.sep)
        .join('-');

      // Store the path with forward slashes for consistency
      result[key] = './' + relativePath.split(path.sep).join('/');
    }
  }

  return result;
}

// Main function
function generateBundleJson() {
  const publicDir = path.resolve('public/img');

  // Check if public directory exists
  if (!fs.existsSync(publicDir)) {
    console.error('Error: "public" directory not found');
    process.exit(1);
  }

  // Scan the directory
  const bundle = scanDirectory(publicDir);

  // Ensure src directory exists
  const srcDir = path.resolve('src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Write the output file
  const outputPath = path.join(srcDir, 'bundle.json');
  fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));

  console.log(`Successfully generated ${outputPath}`);
  console.log(`Found ${Object.keys(bundle).length} files`);
}

// Run the function
generateBundleJson();