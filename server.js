// import express from "express";
// import fs from "fs/promises";
// import { existsSync, writeFileSync } from "fs";

// const app = express();
// const LOG_FILE = ".shadow-trace.json";

// if (!existsSync(LOG_FILE)) writeFileSync(LOG_FILE, JSON.stringify([]));

// app.use(express.json());

// app.post("/update", async (req, res) => {
//     try {
//         const { user, xp, color } = req.body;
//         if (!user || typeof user !== 'string') return res.status(400).send("Invalid User");
        
//         const data = await fs.readFile(LOG_FILE, "utf-8");
//         const logs = JSON.parse(data);

//         const newEntry = {
//             user: user.substring(0, 20),
//             xp: Number(xp) || 0,
//             color: /^#[0-9A-F]{6}$/i.test(color) ? color : "#00ffcc",
//             timestamp: Date.now()
//         };

//         logs.unshift(newEntry);
//         await fs.writeFile(LOG_FILE, JSON.stringify(logs.slice(0, 1000), null, 2));
//         res.sendStatus(200);
//     } catch (e) {
//         res.status(500).send("Server Error");
//     }
// });

// app.get("/", async (req, res) => {
//     let logs = [];
//     try {
//         const data = await fs.readFile(LOG_FILE, "utf-8");
//         logs = JSON.parse(data);
//     } catch (e) { logs = []; }

//     const scores = logs.reduce((acc, l) => {
//         if (!acc[l.user]) {
//             acc[l.user] = { xp: 0, color: l.color || "#00ffcc", contributions: 0 };
//         }
//         acc[l.user].xp += (Number(l.xp) || 0);
//         acc[l.user].contributions++;
//         return acc;
//     }, {});

//     const totalXP = Object.values(scores).reduce((s, u) => s + u.xp, 0);
//     const ecoData = JSON.stringify({ scores, totalXP });

//     const html = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>Primeval Forest | Persistent Growth</title>
//     <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;700&display=swap" rel="stylesheet">
//     <style>
//         :root { --glass: rgba(10, 12, 18, 0.95); --border: rgba(255, 255, 255, 0.08); --gold: #ffd700; }
//         body { margin: 0; background: #02040a; color: #e2e8f0; font-family: 'Outfit', sans-serif; display: flex; height: 100vh; overflow: hidden; }
        
//         #sidebar { width: 340px; background: var(--glass); backdrop-filter: blur(30px); border-right: 1px solid var(--border); padding: 40px; z-index: 10; display: flex; flex-direction: column; }
//         .brand { font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #475569; margin-bottom: 5px; }
//         h1 { margin: 0 0 25px 0; font-size: 28px; font-weight: 700; color: #fff; }
        
//         .stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 30px; }
//         .stat-card span { font-size: 11px; color: #64748b; text-transform: uppercase; }
//         .stat-card b { display: block; font-size: 26px; color: #00ffcc; }
        
//         #users { flex: 1; overflow-y: auto; padding-right: 10px; }
//         #users::-webkit-scrollbar { width: 4px; }
//         #users::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        
//         .contributor { padding: 15px; margin-bottom: 12px; background: rgba(255,255,255,0.02); border-left: 3px solid; border-radius: 4px; position: relative; transition: 0.3s; }
//         .contributor b { font-size: 15px; display: block; color: #fff; }
//         .contributor i { font-size: 11px; font-style: normal; color: #64748b; display: block; margin-top: 4px; }
        
//         .stage-tag { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; text-transform: uppercase; margin-top: 8px; display: inline-block; padding: 2px 6px; background: rgba(255,255,255,0.05); border-radius: 4px; }
//         .eco-badge { position: absolute; top: 15px; right: 15px; font-size: 9px; background: var(--gold); color: #000; padding: 3px 8px; border-radius: 20px; font-weight: 800; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
        
//         #canvas-container { flex: 1; position: relative; cursor: grab; background: #010206; }
//         canvas { display: block; }
//     </style>
// </head>
// <body>

// <div id="sidebar">
//     <div class="brand">Project Vitality</div>
//     <h1>Primeval</h1>
//     <div class="stat-card"><span>Ecosystem Power</span><b id="total-xp">0 XP</b></div>
//     <div id="users"></div>
// </div>

// <div id="canvas-container">
//     <canvas id="canvas"></canvas>
// </div>

// <script>
//     const data = ${ecoData};
//     const XP_GOLDEN = 100000;
    
//     document.getElementById("total-xp").innerText = data.totalXP.toLocaleString() + " XP";
//     const usersList = Object.entries(data.scores).sort((a,b) => b[1].xp - a[1].xp);
//     const usersDiv = document.getElementById("users");

//     function getStageInfo(xp) {
//         if (xp >= XP_GOLDEN) return { name: "Guardian", color: "#ffd700" };
//         if (xp > 50000) return { name: "Ancient", color: "#e2e8f0" };
//         if (xp > 25000) return { name: "Elder", color: "#94a3b8" };
//         if (xp > 10000) return { name: "Matured", color: "#64748b" };
//         return { name: "Sprout", color: "#475569" };
//     }

//     usersList.forEach(([name, d]) => {
//         const isGolden = d.xp >= XP_GOLDEN;
//         const stage = getStageInfo(d.xp);
//         usersDiv.innerHTML += \`
//             <div class="contributor" style="border-color: \${isGolden ? 'var(--gold)' : d.color}">
//                 \${isGolden ? '<span class="eco-badge">REAL TREE PLANTED</span>' : ''}
//                 <b>\${name}</b>
//                 <i>\${d.xp.toLocaleString()} XP • \${d.contributions} days</i>
//                 <span class="stage-tag" style="color: \${stage.color}">Stage: \${stage.name}</span>
//             </div>\`;
//     });

//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
//     let w, h;
//     let camera = { x: 0, y: 0, zoom: 0.7 };
//     let isDragging = false;
//     let dragStart = { x: 0, y: 0 };

//     function resize() {
//         w = canvas.width = window.innerWidth - 340;
//         h = canvas.height = window.innerHeight;
//     }
//     window.addEventListener("resize", resize);
//     resize();

//     // Controls
//     canvas.addEventListener('wheel', e => {
//         e.preventDefault();
//         const factor = Math.pow(1.1, -e.deltaY / 150);
//         camera.zoom = Math.min(Math.max(camera.zoom * factor, 0.05), 4);
//     }, { passive: false });

//     canvas.addEventListener('mousedown', e => { isDragging = true; dragStart = { x: e.offsetX - camera.x, y: e.offsetY - camera.y }; });
//     window.addEventListener('mousemove', e => { if (isDragging) { camera.x = e.offsetX - dragStart.x; camera.y = e.offsetY - dragStart.y; } });
//     window.addEventListener('mouseup', () => isDragging = false);

//     function drawTree(ctx, x, y, xp, contributions, color, seed, time) {
//         const isGolden = xp >= XP_GOLDEN;
//         const isExtreme = xp > 10000;
        
//         // Massive increase in range for Golden trees
//         const depthBoost = isGolden ? 3 : 0;
//         const maxDepth = Math.min(2 + Math.floor(contributions / 4) + depthBoost, 14);
//         const trunkLen = 40 + Math.min(xp / (isGolden ? 50 : 70), isGolden ? 400 : 250);
//         const treeColor = isGolden ? "#ffd700" : color;
        
//         let s = seed + 100;
//         const rand = () => { s = Math.sin(s) * 10000; return s - Math.floor(s); };

//         function branch(x1, y1, len, angle, width, depth) {
//             if (depth > maxDepth) {
//                 // THE GOLDEN FRUIT (Only one at the very top)
//                 if (isGolden && len < 5 && rand() > 0.98) {
//                     ctx.beginPath();
//                     ctx.arc(x1, y1, 12, 0, Math.PI * 2);
//                     ctx.fillStyle = "#fff";
//                     ctx.shadowBlur = 40;
//                     ctx.shadowColor = "#ffd700";
//                     ctx.fill();
//                     ctx.shadowBlur = 0;
//                 }
//                 return;
//             }

//             const x2 = x1 + Math.cos(angle) * len;
//             const y2 = y1 + Math.sin(angle) * len;

//             ctx.beginPath();
//             ctx.moveTo(x1, y1);
//             ctx.lineTo(x2, y2);
//             ctx.lineWidth = width;
//             ctx.lineCap = "round";
            
//             // Rendering logic
//             if (isGolden) {
//                 ctx.strokeStyle = "#ffd700";
//                 ctx.shadowBlur = depth > maxDepth - 3 ? 15 : 0;
//                 ctx.shadowColor = "#ffd700";
//             } else {
//                 ctx.strokeStyle = (depth < 2) ? "#0f172a" : treeColor;
//                 ctx.shadowBlur = (isExtreme && depth > maxDepth - 2) ? 15 : 0;
//                 ctx.shadowColor = treeColor;
//             }

//             ctx.stroke();

//             const branchCount = (xp > 25000 && depth > maxDepth - 3) ? 3 : 2;
//             const nextLen = len * (0.7 + rand() * 0.1);
            
//             for (let i = 0; i < branchCount; i++) {
//                 const spread = 0.35 + rand() * 0.3;
//                 let nextAngle = angle + (branchCount === 2 ? (i === 0 ? -spread : spread) : (i - 1) * spread);
//                 branch(x2, y2, nextLen, nextAngle, width * 0.65, depth + 1);
//             }
//         }

//         // AMBIENT GOLDEN AURA
//         if (isGolden) {
//             for (let i = 0; i < 8; i++) {
//                 const pX = x + Math.sin(time / 800 + i) * 120;
//                 const pY = y - (rand() * trunkLen * 2);
//                 ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
//                 ctx.beginPath();
//                 ctx.arc(pX, pY, 1.5, 0, Math.PI * 2);
//                 ctx.fill();
//             }
//         }

//         branch(x, y, trunkLen, -Math.PI / 2, maxDepth * 1.5, 0);
//     }

//     function animate(t) {
//         ctx.setTransform(1, 0, 0, 1, 0, 0);
//         ctx.clearRect(0, 0, w, h);
//         ctx.translate(camera.x, camera.y);
//         ctx.scale(camera.zoom, camera.zoom);

//         const groundY = h * 0.9;
//         // Wider spacing to accommodate massive golden trees
//         const spacing = 500;

//         usersList.forEach(([name, d], i) => {
//             const x = spacing * (i + 1);
//             const sway = Math.sin(t / 2000 + i) * (d.xp >= XP_GOLDEN ? 1 : 5);
            
//             drawTree(ctx, x + sway, groundY, d.xp, d.contributions, d.color, i, t);
            
//             ctx.shadowBlur = 0;
//             ctx.textAlign = "center";
//             ctx.fillStyle = "#fff";
//             ctx.font = "700 16px Outfit";
//             ctx.fillText(name.toUpperCase(), x + sway, groundY + 50);
            
//             const isGolden = d.xp >= XP_GOLDEN;
//             ctx.fillStyle = isGolden ? "#ffd700" : "#64748b";
//             ctx.font = "800 11px Outfit";
//             ctx.letterSpacing = "3px";
//             ctx.fillText(isGolden ? "PLANETARY GUARDIAN" : "FOREST CITIZEN", x + sway, groundY + 70);
//             ctx.letterSpacing = "0px";
//         });

//         requestAnimationFrame(animate);
//     }
//     requestAnimationFrame(animate);
// </script>
// </body>
// </html>
//     `;
//     res.send(html);
// });

// const PORT = 3000;
// app.listen(PORT, "0.0.0.0", () =>
//     console.log("🌳 Forest Online: http://localhost:" + PORT)
// );





























import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const GITHUB_USER = "bhar1itr"; 

app.use(express.static("public"));

app.get("/api/repos", async (req, res) => {
    let allRepos = [];
    let page = 1;
    try {
        while (true) {
            const response = await axios.get(`https://api.github.com/users/${GITHUB_USER}/repos`, {
                params: { per_page: 100, page: page },
                headers: { "User-Agent": "Github-Forest-Game" }
            });
            if (response.data.length === 0) break;
            allRepos = allRepos.concat(response.data);
            page++;
        }
        res.json(allRepos.map(repo => ({
            name: repo.name,
            stars: repo.stargazers_count,
            size: repo.size,
            url: repo.html_url,
            isGolden: repo.stargazers_count > 10 
        })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.listen(PORT, () => console.log(`🎮 Game Server: http://localhost:${PORT}`));