const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "imagen",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "ai",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Génère des images IA utilisant Imagen (stream)" },
    longDescription: { en: "Envoie une invite et le bot générera une image en utilisant l'API Imagen (API Aryan), prend en charge le téléchargement en flux." },
    guide: { en: "{pn} <invite>\n\nExemple:\n{pn} chat dans un jardin" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Veuillez fournir une invite pour Imagen.", event.threadID, event.messageID);

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    const prompt = args.join(" ");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/imgen?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl, { responseType: "stream", timeout: 60000 });

      const filename = `imagen_${Date.now()}.jpeg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      res.data.pipe(writer);

      writer.on("finish", () => {
        const msg = `
╔═════════════════════════════
║ ✨ 𝐈𝐌𝐀𝐆𝐄 𝐈𝐀 𝐈𝐌𝐀𝐆𝐄𝐍 ✨
╠═════════════════════════════
║ 💬 Invite : "${prompt}"
║ 📤 Génération terminée !
╚═════════════════════════════
        `.trim();

        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => {
          try { fs.unlinkSync(filepath); } catch {}
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ Erreur d'écriture du fichier:", err.message);
        api.sendMessage("❌ Erreur lors de l'enregistrement de l'image IA Imagen.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Erreur de génération de l'image IA Imagen:", err.message);
      api.sendMessage("❌ Échec de la génération de l'image IA Imagen.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
