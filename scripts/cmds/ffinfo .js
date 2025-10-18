const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "ffinfo",
    version: "1.1.0",
    author: "Christus x Aesther",
    role: 0,
    countDown: 10,
    shortDescription: { fr: "Obtenir les infos détaillées d'un joueur Free Fire par UID" },
    longDescription: { fr: "Récupère toutes les statistiques d'un joueur Free Fire via son UID." },
    category: "jeu",
    guide: { fr: "{pn} <UID>" },
    noPrefix: true
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage("❗ Veuillez fournir un UID Free Fire", event.threadID, event.messageID);
      }

      const uid = args[0].trim();
      const url = `https://aryan-nix-apis.vercel.app/api/ffinfo?uid=${uid}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.basicInfo) {
        return api.sendMessage(`❌ Aucune donnée trouvée pour l'UID : ${uid}`, event.threadID, event.messageID);
      }

      const b = data.basicInfo;
      const s = data.socialInfo || {};
      const p = data.petInfo || {};
      const d = data.diamondCostRes || {};
      const c = data.creditScoreInfo || {};
      const lastLogin = b.lastLoginAt ? new Date(parseInt(b.lastLoginAt) * 1000).toLocaleString() : "Inconnu";
      const createAt = b.createAt ? new Date(parseInt(b.createAt) * 1000).toLocaleString() : "Inconnu";

      const clothes = Array.isArray(data.profileInfo?.clothes) ? data.profileInfo.clothes.join(", ") : "Aucun";
      const skills = Array.isArray(data.profileInfo?.equipedSkills) ? data.profileInfo.equipedSkills.join(", ") : "Aucune";

      const message =
`🎮 𝗜𝗻𝗳𝗼 𝗝𝗼𝘂𝗲𝘂𝗿 𝗙𝗿𝗲𝗲 𝗙𝗶𝗿𝗲 — UID : ${uid}

👤 𝗦urnom : ${b.nickname}
🌍 𝗥égion : ${b.region}
⭐ 𝗡iveau : ${b.level} (Exp : ${b.exp?.toLocaleString() || "N/A"})
🏆 𝗥ang : ${b.rank} (Points : ${b.rankingPoints || "N/A"})
❤️ 𝗔imé : ${b.liked || 0}
⏰ 𝗗ernière connexion : ${lastLogin}
📅 𝗖ompte créé le : ${createAt}

👕 𝗩êtements : ${clothes}
💥 𝗖ompétences équipées : ${skills}

🐾 𝗔mi animal : ${p.id ? `ID ${p.id}, Niveau ${p.level}, Skin ${p.skinId}` : "Aucune info"}

💎 𝗖oût en diamants : ${d.diamondCost || "N/A"}

📊 𝗖rédits : ${c.creditScore || "N/A"}

📝 𝗦ignature : ${s.signature || "Aucune"}
🗣️ 𝗟angue : ${s.language || "Inconnu"}`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (e) {
      console.error("Erreur ffinfo :", e);
      return api.sendMessage(`⚠️ Une erreur est survenue : ${e.message}`, event.threadID, event.messageID);
    }
  },
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
