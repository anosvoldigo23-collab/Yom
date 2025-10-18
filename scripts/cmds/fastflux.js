const fs = require("fs");
const path = require("path");
const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "fastflux",
    version: "1.1",
    author: "Christus",
    role: 0,
    countDown: 5,
    category: "AI-IMAGE",
    shortDescription: { fr: "Génère une image avec le modèle Fast Flux à partir d'un prompt" },
    longDescription: { fr: "Crée une image en utilisant le modèle Fast Flux selon le prompt fourni." },
    guide: { fr: "Réponds à un message ou tape : fastflux <prompt>" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ | Vous devez fournir un prompt pour générer l'image.");

    const waitMsg = await message.reply("🔄 | Génération de votre image, veuillez patienter...");

    try {
      const apiUrl = `http://65.109.80.126:20511/api/fastfluximg?text=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Création du cache si inexistant
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imagePath = path.join(cacheDir, `${Date.now()}_fastflux.png`);
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

      await message.reply({
        body: `✅ | Image générée pour : "${prompt}"`,
        attachment: fs.createReadStream(imagePath)
      });

      // Suppression de l'image temporaire
      fs.unlinkSync(imagePath);

      // Supprime le message d'attente
      await message.unsend(waitMsg.messageID);

    } catch (err) {
      console.error("Erreur FastFlux :", err);
      message.reply("❌ | Une erreur est survenue lors de la génération de l'image. Veuillez réessayer plus tard.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
