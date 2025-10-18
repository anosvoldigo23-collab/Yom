const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "love",
    version: "1.3",
    author: "Christus x Aesther",
    countDown: 10,
    role: 0,
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "💞 Crée une image d'amour entre deux utilisateurs",
    longDescription: "Génère une image de ship avec pourcentage d'amour et réaction entre deux profils",
    guide: "{pn} @utilisateur\nEx : {pn} @alice"
  },

  onStart: async function ({ api, event, message }) {
    const { mentions, senderID } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length < 1) {
      return message.reply("❌ Veuillez mentionner un utilisateur pour créer le ship. Exemple :\n+love @utilisateur");
    }

    const uid1 = senderID;
    const uid2 = mentionIDs[0];

    // Noms des utilisateurs
    let name1 = "Vous";
    let name2 = mentions[uid2] || "Utilisateur";

    try {
      const user1Data = await api.getUserInfo(uid1);
      const user2Data = await api.getUserInfo(uid2);
      name1 = user1Data[uid1].name;
      name2 = user2Data[uid2].name;
    } catch (err) {
      console.error("Erreur récupération noms :", err);
    }

    // Pourcentage d'amour et réaction
    const lovePercent = Math.floor(Math.random() * 91) + 10;
    let reaction = lovePercent >= 80 ? "💖 Match parfait ! 💖" :
                   lovePercent >= 50 ? "💘 Bon match ! 💘" :
                   "💔 Besoin d'un peu d'amour... 💔";

    const avatar1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512`;
    const avatar2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512`;

    try {
      const res = await axios.get(
        `https://api.popcat.xyz/v2/ship?user1=${encodeURIComponent(avatar1)}&user2=${encodeURIComponent(avatar2)}`,
        { responseType: "arraybuffer" }
      );

      const filePath = path.join(__dirname, "cache", `ship_${uid1}_${uid2}_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, res.data);

      const caption = `
╔═════════════════════════════
║ 💞 𝗟𝗢𝗩𝗘 𝗦𝗛𝗜𝗣 💞
╠═════════════════════════════
║ 👤 ${name1} ❤ ${name2}
║ ❤️ Pourcentage d'amour : ${lovePercent}%
║ 💌 Réaction : ${reaction}
╚═════════════════════════════
      `.trim();

      message.reply({
        body: caption,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error("❌ Erreur Love Ship :", err);
      message.reply("❌ Échec de la génération de l'image d'amour. Réessayez plus tard.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
