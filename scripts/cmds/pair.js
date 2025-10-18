const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "pair",
    aliases: [],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "love",
    shortDescription: "🥰 Fait matcher deux utilisateurs",
    longDescription: "Calcule un taux de compatibilité aléatoire et envoie un message avec avatars et GIF d'amour",
    guide: "{pn}",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;
    const { participantIDs } = await api.getThreadInfo(threadID);

    // ID bot et liste des autres utilisateurs
    const botID = api.getCurrentUserID();
    const others = participantIDs.filter(id => id !== botID && id !== senderID);
    if (!others.length) return api.sendMessage("⚠️ Aucun partenaire disponible pour matcher.", threadID, messageID);

    // Sélection aléatoire
    const targetID = others[Math.floor(Math.random() * others.length)];

    // Noms
    const senderName = (await usersData.get(senderID)).name;
    const targetName = (await usersData.get(targetID)).name;

    // Taux de compatibilité aléatoire
    const lovePercent = Math.floor(Math.random() * 101);

    // Mentions
    const mentions = [
      { id: senderID, tag: senderName },
      { id: targetID, tag: targetName }
    ];

    // Préparer les images
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const avatar1 = await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    fs.writeFileSync(path.join(cacheDir, "avt1.png"), avatar1.data);

    const avatar2 = await axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    fs.writeFileSync(path.join(cacheDir, "avt2.png"), avatar2.data);

    const loveGif = await axios.get("https://i.ibb.co/y4dWfQq/image.gif", { responseType: "arraybuffer" });
    fs.writeFileSync(path.join(cacheDir, "love.gif"), loveGif.data);

    const attachments = [
      fs.createReadStream(path.join(cacheDir, "avt1.png")),
      fs.createReadStream(path.join(cacheDir, "love.gif")),
      fs.createReadStream(path.join(cacheDir, "avt2.png"))
    ];

    // Message stylé
    const messageBody = `
╔══════════════════════
║ 🥰 𝐀𝐩𝐩𝐚𝐫𝐢𝐞𝐦𝐞𝐧𝐭 𝐑𝐞́𝐮𝐬𝐬𝐢 !
╠══════════════════════
║ 💌 ${senderName} 💓 ${targetName}
║ 💕 Taux de compatibilité : ${lovePercent}%
║ 🥂 Je vous souhaite à tous les deux cent ans de bonheur !
╚══════════════════════
    `.trim();

    // Envoyer le message
    return api.sendMessage({ body: messageBody, mentions, attachment: attachments }, threadID, messageID);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
