import * as fs from 'fs';
import * as path from 'path';

// Function to recursively scan directories and collect file paths
function scanDirectory(directory: string, dirName: string, basePath: string = '') {
    const result: Array<{ alias: string, src: string }> = [];
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const itemPath = path.join(directory, item);
        const stats = fs.statSync(itemPath);
        if (itemPath.endsWith('.css')) continue;

        if (stats.isDirectory()) {
            // If it's a directory, recursively scan it
            const nestedResults = scanDirectory(
                itemPath,
                dirName,
                path.join(basePath, item)
            );

            // Merge nested results into our result object
            result.push(...nestedResults);
            //Object.assign(result, nestedResults);
        } else {
            // If it's a file, add it to our results
            // Create the key by removing file extension and replacing any path separators with hyphens
            const relativePath = path.join(basePath, item);
            const key = relativePath
                .replace(/\.[^/.]+$/, '') // Remove file extension
                .split(path.sep)
                .join('-');

            // Store the path with forward slashes for consistency
            result.push({
                alias: key,
                src: './' + dirName + '/' + relativePath.split(path.sep).join('/')
            });
        }
    }
    return result;
}

// Main function
function generateBundleJson(directory: string, name: string) {
    const dir = "public/" + directory;
    // Check if public directory exists
    if (!fs.existsSync(dir)) {
        console.error('Error: "img" directory not found');
        process.exit(1);
    }

    // Scan the directory
    console.log(`Scanning ${directory}`);
    const assets = scanDirectory(dir, directory);

    // Ensure src directory exists
    const srcDir = path.resolve('src');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    const obj = {
        name,
        assets
    };
    // Write the output file
    const outputPath = path.join(srcDir, name + '.json');
    fs.writeFileSync(outputPath, JSON.stringify(obj, null, 2));

    console.log(`Successfully generated ${outputPath}`);
    console.log(`Found ${assets.length} files`);
}

function generateBundles() {
    generateBundleJson('img', 'bundle');
    generateBundleJson('audio', 'bundle_sound');
}

// Run the function
generateBundles();