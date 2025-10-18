const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const g = require('fca-aryan-nix'); // Import GoatWrapper

const cardPath = path.join(__dirname, 'cache', 'otakucard');
fs.ensureDirSync(cardPath);

module.exports = {
  config: {
    name: "otakucard",
    aliases: ["animeid", "otaku"],
    version: "1.1",
    author: "Aesther x Christus",
    role: 0,
    shortDescription: "🎴 Génére ta carte d'identité Otaku !",
    longDescription: "Une carte de profil pour les fans d'anime avec image, pseudo et préférences otaku.",
    category: "🎌 Anime",
    guide: "{pn} <Anime préféré> | <Rôle otaku> | <Niveau>",
    noPrefix: true // Noprefix activé
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").split("|").map(s => s.trim());
    if (input.length < 3) return;

    const [anime, role, level] = input;
    const { threadID, senderID } = event;

    try {
      const name = (await api.getUserInfo(senderID))[senderID].name;
      const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = (await axios.get(avatarURL, { responseType: 'arraybuffer' })).data;

      const avatarFile = path.join(cardPath, `${senderID}.png`);
      fs.writeFileSync(avatarFile, avatarData);

      const card = await createOtakuCard({ name, anime, role, level, avatarPath: avatarFile });
      await message.reply({
        body: `📛 Ta carte Otaku est prête, ${name} !`,
        attachment: fs.createReadStream(card)
      }, () => {
        fs.unlinkSync(avatarFile);
        fs.unlinkSync(card);
      });

    } catch (e) {
      console.error(e);
    }
  }
};

async function createOtakuCard({ name, anime, role, level, avatarPath }) {
  const width = 700, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = "#1b1b2f";
  ctx.fillRect(0, 0, width, height);

  // Avatar
  const avatar = await loadImage(avatarPath);
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 20, 20, 160, 160);
  ctx.restore();

  // Texte Otaku
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 28px Arial";
  ctx.fillText("🎴 OTAKU CARD", 250, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";
  ctx.fillText(`👤 Nom : ${name}`, 250, 100);
  ctx.fillText(`🎌 Anime préféré : ${anime}`, 250, 150);
  ctx.fillText(`🎮 Rôle Otaku : ${role}`, 250, 200);
  ctx.fillText(`⭐ Niveau : ${level}`, 250, 250);

  ctx.font = "italic 16px Arial";
  ctx.fillStyle = "#aaa";
  ctx.fillText("🔗 Carte générée par GoatBot | Christus", 180, 370);

  // Sauvegarde
  const file = path.join(cardPath, `otaku_${Date.now()}.png`);
  fs.writeFileSync(file, canvas.toBuffer());
  return file;
}

// Active noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
