import fs from 'fs';
import ollama from 'ollama';

async function runOracle() {
    const LOG_FILE = '.shadow-trace.json';
    if (!fs.existsSync(LOG_FILE)) return console.log("❌ No seeds planted yet.");

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    
    // Build unique file stats for the Tree
    const treeStats = {};
    logs.forEach(log => {
        if (!treeStats[log.file]) {
            treeStats[log.file] = { lines: log.lines, edits: 0, lastUser: log.user };
        }
        treeStats[log.file].edits++;
    });

    console.log('\n🌲 THE WORLD TREE STATUS');
    Object.keys(treeStats).forEach(file => {
        console.log(`┣━━ 🌿 ${file} (${treeStats[file].lines} lines) | Managed by: ${treeStats[file].lastUser}`);
    });

    console.log('\n🔮 CONSULTING THE AI ORACLE...');
    const context = logs.slice(0, 5).map(l => `File: ${l.file}\nCode: ${l.diff}`).join('\n');

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: `Summarize the recent growth of this code tree and give the developer a "coding quest" for next: ${context}` }],
        });
        console.log(`\n✨ ORACLE SAYS: ${response.message.content}`);
    } catch (e) {
        console.log("❌ Oracle is sleeping. (Make sure Ollama is running)");
    }
}

runOracle();