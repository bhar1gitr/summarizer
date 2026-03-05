import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const LOG_FILE = '.shadow-trace.json';

app.use(express.json());

// API Endpoint for other machines to send data
app.post('/update', (req, res) => {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    logs.unshift(req.body);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs.slice(0, 500), null, 2)); // Keep last 500 actions
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    let logs = [];
    try {
        logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8') || '[]');
    } catch (e) { logs = []; }
    
    const scores = logs.reduce((acc, l) => {
        if (!acc[l.user]) acc[l.user] = { xp: 0, color: l.color };
        acc[l.user].xp += (l.xp || 0);
        return acc;
    }, {});

    const totalXP = logs.reduce((sum, l) => sum + (l.xp || 0), 0);
    const adminName = "Admin"; 

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🌳 Ecosystem Core</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;800&display=swap');
            body { background: #010409; color: #e6edf3; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; overflow: hidden; display: flex; }
            #sidebar { width: 320px; background: rgba(1, 4, 9, 0.95); backdrop-filter: blur(20px); height: 100vh; padding: 30px; border-right: 1px solid #30363d; z-index: 100; }
            #canvas-container { flex-grow: 1; position: relative; background: #010409; }
            canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            .user-tag { padding: 10px; margin-bottom: 10px; border-radius: 8px; background: rgba(255,255,255,0.03); border-left: 4px solid; }
        </style>
    </head>
    <body>
        <div id="sidebar">
            <h2 style="font-size: 11px; letter-spacing: 2px; color: #7d8590; margin-bottom: 20px;">KINGDOM HIERARCHY</h2>
            ${Object.entries(scores).map(([name, data]) => `
                <div class="user-tag" style="border-color: ${data.color}">
                    <strong>${name}</strong> • <span style="color: #3fb950;">${data.xp} XP</span>
                </div>
            `).join('')}
        </div>
        <div id="canvas-container">
            <canvas id="bgCanvas"></canvas>
            <canvas id="treeCanvas"></canvas>
        </div>

        <script>
            const bgCanvas = document.getElementById('bgCanvas');
            const canvas = document.getElementById('treeCanvas');
            const bgCtx = bgCanvas.getContext('2d');
            const ctx = canvas.getContext('2d');
            const userData = ${JSON.stringify(scores)};
            const totalXP = ${totalXP};

            function resize() {
                bgCanvas.width = canvas.width = window.innerWidth - 320;
                bgCanvas.height = canvas.height = window.innerHeight;
                drawBackground();
            }
            window.onresize = resize; resize();

            function drawBackground() {
                const grad = bgCtx.createRadialGradient(bgCanvas.width/2, bgCanvas.height, 0, bgCanvas.width/2, bgCanvas.height, bgCanvas.height);
                grad.addColorStop(0, '#0d1117'); grad.addColorStop(1, '#010409');
                bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
            }

            function drawBranch(x, y, len, angle, width, depth, color) {
                const sway = Math.sin(Date.now() * 0.001 + depth) * (depth * 0.25);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((angle + sway) * Math.PI / 180);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, -len); ctx.stroke();

                if (depth > 0) {
                    drawBranch(0, -len, len * 0.75, angle - 25, width * 0.7, depth - 1, color);
                    drawBranch(0, -len, len * 0.75, angle + 25, width * 0.7, depth - 1, color);
                } else {
                    ctx.fillStyle = "#238636";
                    ctx.beginPath(); ctx.arc(0, -len, 4, 0, Math.PI*2); ctx.fill();
                }
                ctx.restore();
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const centerX = canvas.width / 2;
                const groundY = canvas.height - 80;

                // Admin Trunk
                const adminXP = userData["Admin"] ? userData["Admin"].xp : 100;
                const trunkH = 100 + Math.min(adminXP / 10, 200);
                drawBranch(centerX, groundY, trunkH, 0, 15, 2, "#452205");

                // Contributor Branches
                let i = 0;
                for(let user in userData) {
                    if(user === "Admin") continue;
                    const u = userData[user];
                    const attachY = groundY - (trunkH * 0.4) - (i * 30);
                    drawBranch(centerX, attachY, 60 + (u.xp/20), (i%2?45:-45), 5, Math.min(u.xp/200, 5), u.color);
                    i++;
                }
                requestAnimationFrame(animate);
            }
            animate();
            setTimeout(() => location.reload(), 5000);
        </script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(3000, '0.0.0.0', () => console.log('🌐 Server live on port 3000'));