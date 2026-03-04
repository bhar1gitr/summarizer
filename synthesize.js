import fs from 'fs';
import ollama from 'ollama';

async function generateProgressReport() {
    const LOG_FILE = '.shadow-trace.json';
    if (!fs.existsSync(LOG_FILE)) {
        console.log("❌ No logs found! Go code something first.");
        return;
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const today = new Date().toLocaleDateString();
    
    // 1. GENERATE THE VISUAL TREE
    const projectTree = {};
    logs.forEach(log => {
        if (!projectTree[log.file]) {
            projectTree[log.file] = {
                lastTouched: log.date,
                updates: 0,
                lines: log.lineCount,
                content: log.diff // Save the latest content for AI
            };
        }
        projectTree[log.file].updates++;
    });

    console.log(`\n📂 PROJECT TREE & PROGRESS (${today})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.keys(projectTree).forEach(file => {
        const data = projectTree[file];
        const statusIcon = data.lastTouched === today ? '🟢' : '⚪';
        console.log(`${statusIcon} ${file} (${data.lines} lines)`);
        console.log(`   ┗━━ Total Edits: ${data.updates}`);
    });

    // 2. GENERATE AI DOCUMENTATION
    console.log('\n🤖 AI is synthesizing your progress...');
    
    const codeContext = Object.keys(projectTree).map(file => 
        `FILE: ${file}\nCONTENT:\n${projectTree[file].content}`
    ).join('\n\n---\n\n');

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a project manager. Based on the file tree and code snippets, provide a 3-sentence summary of today\'s progress and what should be done next.' 
                },
                { 
                    role: 'user', 
                    content: `Here is my current project state:\n\n${codeContext}` 
                }
            ],
        });

        const report = response.message.content;
        console.log('\n✨ AI PROGRESS SUMMARY:');
        console.log(report);
        
        // Save to a markdown file
        fs.writeFileSync('PROGRESS_REPORT.md', `# Progress Report - ${today}\n\n${report}`);
        console.log('\n✅ Report saved to PROGRESS_REPORT.md');

    } catch (error) {
        console.error('❌ AI Error: Make sure Ollama is running!');
    }
}

generateProgressReport();