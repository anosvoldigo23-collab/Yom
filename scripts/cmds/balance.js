const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHex(ctx, cx, cy, r, stroke, lineWidth = 3, glow = false) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = glow ? stroke : "transparent";
  ctx.shadowBlur = glow ? 25 : 0;
  ctx.stroke();
}

function clipHex(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();
}

async function drawBalanceCard(data) {
  const W = 1400, H = 600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // 🎨 Fond sombre avec dégradé
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0a0a");
  bg.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 🌟 Particules légères
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
    ctx.fill();
  }

  // 🔷 Avatar à gauche avec glow hex
  const avatarX = 200, avatarY = 300, radius = 120;
  for (let i = 3; i > 0; i--) drawHex(ctx, avatarX, avatarY, radius + i * 15, `rgba(0,255,255,${0.08 * i})`, 4);
  drawHex(ctx, avatarX, avatarY, radius + 4, "#00ffff", 3, true);

  ctx.save();
  clipHex(ctx, avatarX, avatarY, radius);
  ctx.drawImage(data.avatar, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
  ctx.restore();

  // 📝 Cadre pour infos à droite
  const infoX = 400, infoY = 150, infoW = 950, infoH = 300;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  roundRect(ctx, infoX, infoY, infoW, infoH, 30);
  ctx.fill();

  // 🔤 Texte infos
  ctx.font = "bold 42px Arial";
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 10;
  ctx.fillText(data.name, infoX + 30, infoY + 60);

  ctx.font = "28px Arial";
  ctx.fillStyle = "#ffffff";
  const lines = [
    `UID: ${data.uid}`,
    `Balance: ${data.balance} $`,
    `Level: ${data.level}`,
    `Rank: #${data.rank}`,
    `Messages: ${data.totalMsg}`,
    `Username: ${data.username || "Not Set"}`,
    `Créateur: CHRISTUS BOT`
  ];
  lines.forEach((text, i) => ctx.fillText(text, infoX + 30, infoY + 110 + i * 45));

  // 🕓 Date
  ctx.font = "24px Arial";
  ctx.fillStyle = "#cccccc";
  ctx.fillText(` Updated: ${moment().tz("Africa/Abidjan").format("YYYY-MM-DD hh:mm A")}`, W/2, H - 30);

  // 💾 Sauvegarde
  const fileName = `balance_${data.uid}_${randomString(6)}.png`;
  const filePath = path.join(__dirname, "cache", fileName);
  if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  return filePath;
}

module.exports = {
  config: {
    name: "balance",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "💰 Affiche la balance de l'utilisateur avec style",
    category: "Fun",
    guide: "{pn} [@mention ou vide pour soi-même]"
  },

  onStart: async function({ api, event, args, usersData, message }) {
    try {
      const { senderID, mentions, messageReply } = event;
      const uid = Object.keys(mentions)[0] || args[0] || (messageReply?.senderID || senderID);

      const userData = await usersData.get(uid);
      if(!userData) return message.reply("❌ User data not found.");
      const uInfo = await api.getUserInfo(uid);
      const info = uInfo[uid];
      if(!info) return message.reply("❌ Failed to fetch user info.");

      let avatar;
      try {
        const avatarUrl = await usersData.getAvatarUrl(uid);
        avatar = await loadImage(avatarUrl);
      } catch {
        avatar = await loadImage("https://i.imgur.com/I3VsBEt.png");
      }

      const drawData = {
        avatar,
        name: info.name || "User",
        uid,
        username: info.vanity || "Not Set",
        balance: userData.money || 0,
        level: userData.level || 1,
        rank: userData.rank || 1,
        totalMsg: userData.totalMsg || 0
      };

      const filePath = await drawBalanceCard(drawData);
      await message.reply({ attachment: fs.createReadStream(filePath) });

      setTimeout(()=> {
        try{ fs.unlinkSync(filePath); } catch {}
      }, 30000);

    } catch(err) {
      console.error(err);
      return message.reply("❌ Failed to generate balance card.");
    }
  }
};
