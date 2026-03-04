import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

const LOG_FILE = '.shadow-trace.json';

// Ensure the log file exists
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([]));

console.log('🌳 SHADOW-TREE IS WATCHING...');
console.log('Status: Tracking progress and file changes side-by-side.');

const watcher = chokidar.watch('.', {
    ignored: [/node_modules/, /\.git/, /\.shadow-trace\.json/],
    persistent: true,
    ignoreInitial: true,
    depth: 99
});

watcher.on('all', async (event, filePath) => {
    if (event === 'add' || event === 'change') {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            const entry = {
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                file: filePath,
                event: event,
                lineCount: content.split('\n').length,
                size: stats.size,
                // Taking a snippet for the AI to understand the "vibe"
                diff: content.length > 800 ? content.substring(0, 800) + "..." : content
            };

            const currentData = fs.readFileSync(LOG_FILE, 'utf8');
            const logs = JSON.parse(currentData || '[]');
            
            // Unshift so the newest activity is always at index 0
            logs.unshift(entry); 
            
            fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
            console.log(`✅ [${event.toUpperCase()}] Updated Tree Node: ${filePath}`);
        } catch (err) {
            // Ignore temporary file errors
        }
    }
});