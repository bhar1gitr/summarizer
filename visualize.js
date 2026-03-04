import fs from 'fs';

function generateTreeReport() {
    const LOG_FILE = '.shadow-trace.json';
    if (!fs.existsSync(LOG_FILE)) return;

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const today = new Date().toLocaleDateString();
    
    // Grouping by File to see the Tree
    const projectTree = {};

    logs.forEach(log => {
        if (!projectTree[log.file]) {
            projectTree[log.file] = {
                lastTouched: log.date,
                updates: 0,
                lines: log.lineCount,
                status: log.date === today ? '🟢 Active Today' : '⚪ Idle'
            };
        }
        projectTree[log.file].updates++;
    });

    console.log(`\n📊 PROJECT PROGRESS REPORT (${today})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.keys(projectTree).forEach(file => {
        const data = projectTree[file];
        console.log(`${data.status} | ${file}`);
        console.log(`   ┗━━ Updates: ${data.updates} | Current Lines: ${data.lines}`);
    });

    // Simple Progress Logic
    const todayFiles = Object.values(projectTree).filter(f => f.lastTouched === today).length;
    console.log(`\n📈 Progress: You worked on ${todayFiles} files today.`);
}

generateTreeReport();