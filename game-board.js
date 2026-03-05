// Add this to your server.js dashboard logic
const renderGameTree = (logs) => {
    // Group XP by user
    const leaderboard = logs.reduce((acc, log) => {
        acc[log.user] = (acc[log.user] || 0) + log.xp;
        return acc;
    }, {});

    return `
    <div class="forest">
        ${Object.entries(leaderboard).map(([name, xp]) => `
            <div class="player-stat">
                <span class="avatar">🧙‍♂️</span>
                <strong>${name}</strong>: LVL ${Math.floor(xp/10)} (${xp} XP)
                <div class="xp-bar"><div style="width: ${xp % 100}%"></div></div>
            </div>
        `).join('')}
    </div>
    <div class="tree-container">
        <p>The Tree currently has ${logs.length} leaves.</p>
    </div>
    `;
}