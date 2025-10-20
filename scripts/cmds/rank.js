const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");

const deltaNext = 5;

function expToLevel(exp) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
}

function levelToExp(level) {
  return Math.floor(((level ** 2 - level) * deltaNext) / 2);
}

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Génère une couleur RGBA aléatoire
function getRandomColor(alpha = 1) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},${alpha})`;
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
  ctx.shadowBlur = glow ? 30 : 0;
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

async function drawRankCard(data) {
  const W = 1400, H = 650;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Fond noir dégradé
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#000000");
  bg.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Particules lumineuses
  for (let i = 0; i < 150; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = getRandomColor(Math.random() * 0.3 + 0.2);
    ctx.fill();
  }

  // Cadre néon
  const offset = 25;
  const neonColor = getRandomColor();
  ctx.save();
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 12;
  roundRect(ctx, offset, offset, W - offset*2, H - offset*2, 50);
  ctx.stroke();
  ctx.restore();

  // Avatar hex
  const centerX = 700, centerY = 180, radius = 120;
  for (let i = 4; i > 0; i--) {
    drawHex(ctx, centerX, centerY, radius + i*18, getRandomColor(0.08 * i), 4);
  }
  drawHex(ctx, centerX, centerY, radius + 5, getRandomColor(0.9), 3, true);

  ctx.save();
  clipHex(ctx, centerX, centerY, radius);
  ctx.drawImage(data.avatar, centerX - radius, centerY - radius, radius*2, radius*2);
  ctx.restore();

  // Nom
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = getRandomColor();
  ctx.textAlign = "center";
  ctx.shadowColor = getRandomColor();
  ctx.shadowBlur = 25;
  ctx.fillText(data.name, W/2, 370);

  // Infos gauche/droite
  const leftX = 150, topY = 420, gap = 48;
  ctx.font = "28px Arial";
  ctx.textAlign = "left";
  ctx.fillStyle = getRandomColor();
  [
    `UID: ${data.uid}`,
    `Nickname: ${data.nickname || data.name}`,
    `Gender: ${data.gender}`,
    `Username: ${data.username}`,
    `Level: ${data.level}`
  ].forEach((text,i)=> ctx.fillText(text, leftX, topY + i*gap));

  const rightX = 750;
  ctx.fillStyle = getRandomColor();
  [
    `EXP: ${data.exp} / ${data.requiredExp}`,
    `Rank: #${data.rank}`,
    `Money: ${data.money}`,
    `Money Rank: #${data.moneyRank || "N/A"}`
  ].forEach((text,i)=> ctx.fillText(text, rightX, topY + i*gap));

  // Footer
  ctx.font = "24px Arial";
  ctx.fillStyle = getRandomColor();
  ctx.textAlign = "center";
  ctx.fillText(`Updated: ${moment().tz("Africa/Abidjan").format("YYYY-MM-DD hh:mm A")}`, W/2, H-60);

  // Signature
  ctx.font = "30px Arial";
  ctx.fillStyle = getRandomColor();
  ctx.shadowColor = getRandomColor();
  ctx.shadowBlur = 15;
  ctx.fillText("CHRISTUS BOT", W/2, H-25);

  const fileName = `rank_${data.uid}_${randomString(6)}.png`;
  const filePath = path.join(__dirname, "cache", fileName);
  if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  return filePath;
}

module.exports = {
  config: {
    name: "rank",
    version: "7.2",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🖤 Carte de rang noire futuriste",
    category: "rank",
    guide: "{pn} [@mention ou vide pour soi-même]"
  },

  onStart: async function({ api, event, args, usersData, message }) {
    try {
      const { senderID, mentions, messageReply } = event;
      const uid = Object.keys(mentions)[0] || args[0] || (messageReply?.senderID || senderID);

      const allUsers = await usersData.getAll();
      const sortedExp = allUsers.map(u => ({ id: u.userID, exp: u.exp || 0, money: u.money || 0 }))
        .sort((a,b)=> b.exp - a.exp);
      const rank = sortedExp.findIndex(u => u.id === uid) + 1;

      const sortedMoney = [...allUsers].sort((a,b)=> (b.money || 0) - (a.money || 0));
      const moneyRank = sortedMoney.findIndex(u => u.userID === uid) + 1;

      const userData = await usersData.get(uid);
      if(!userData) return message.reply("❌ User data not found.");
      const uInfo = await api.getUserInfo(uid);
      const info = uInfo[uid];
      if(!info) return message.reply("❌ Failed to fetch user info.");

      const exp = userData.exp || 0;
      const level = expToLevel(exp);
      const nextExp = levelToExp(level+1);
      const currentExp = levelToExp(level);
      const progressExp = exp - currentExp;
      const requiredExp = nextExp - currentExp;

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
        username: (info.vanity && info.vanity.trim()!=="") ? info.vanity : "Not Set",
        gender: ["Unknown","Girl","Boy"][info.gender] || "Unknown",
        nickname: userData.nickname || info.name || "User",
        level,
        exp: progressExp,
        requiredExp,
        money: userData.money || 0,
        totalMsg: userData.totalMsg || 0,
        rank,
        moneyRank
      };

      const filePath = await drawRankCard(drawData);
      await message.reply({ attachment: fs.createReadStream(filePath) });

      setTimeout(()=>{
        try{ fs.unlinkSync(filePath); } catch{}
      }, 30000);

    } catch(err){
      console.error(err);
      return message.reply("❌ Failed to generate rank card.");
    }
  }
};
