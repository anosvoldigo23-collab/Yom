const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Fonction pour récupérer l'URL de base de l'API
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "1.0",
    author: "Christus",
    countDown: 15,
    role: 0,
    shortDescription: "Recherche d'images Pinterest",
    longDescription: "Recherche d'images Pinterest",
    category: "download",
    guide: { en: "{pn} query-limit" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    const queryAndLength = args.join(" ").split("-");
    const q = queryAndLength[0]?.trim();
    const length = queryAndLength[1]?.trim();

    if (!q || !length) return;

    try {
      const w = await api.sendMessage("🔍 Recherche en cours, veuillez patienter...", event.threadID);

      const response = await axios.get(
        `${await baseApiUrl()}/pinterest?search=${encodeURIComponent(q)}&limit=${encodeURIComponent(length)}`
      );

      const data = response.data.data;
      if (!data || data.length === 0) {
        await api.unsendMessage(w.messageID);
        return api.sendMessage("❌ Aucune image trouvée.", event.threadID);
      }

      const diptoo = [];
      const totalImagesCount = Math.min(data.length, parseInt(length));

      for (let i = 0; i < totalImagesCount; i++) {
        const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
        const imgPath = path.join(__dirname, "dvassests", `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        diptoo.push(fs.createReadStream(imgPath));
      }

      await api.unsendMessage(w.messageID);
      await api.sendMessage({
        body: `✅ | Voici les images pour votre recherche : "${q}"\n✏️ | Nombre total : ${totalImagesCount}`,
        attachment: diptoo
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      await api.sendMessage(`❌ Erreur : ${error.message}`, event.threadID, event.messageID);
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
