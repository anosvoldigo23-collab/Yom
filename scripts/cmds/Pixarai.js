const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const g = require("fca-aryan-nix"); // GoatWrapper pour activer noprefix

module.exports = {
  config: {
    name: "pixarai",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "🧠 IA",
    shortDescription: { fr: "🎨 Génère une image IA à partir d’un prompt" },
    longDescription: { fr: "Utilise l'API Pixarai pour créer une image en fonction de ce que vous décrivez." },
    guide: { fr: "<prompt>" },
    noPrefix: true
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Veuillez entrer une description pour générer une image.\nExemple : `Un chat dans l’espace` 🐱🚀");
    }

    const apiUrl = `https://arychauhann.onrender.com/api/pixarai?prompt=${encodeURIComponent(prompt)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.result || !data.result.url) {
        return message.reply("⚠️ Impossible de générer l'image. Réessayez avec une autre description.");
      }

      const imageUrl = data.result.url;
      const filePath = path.join(__dirname, "cache", `${data.result.id || "pixarai"}.webp`);

      // Crée le dossier cache si inexistant
      await fs.ensureDir(path.join(__dirname, "cache"));

      // Téléchargement de l'image
      const file = fs.createWriteStream(filePath);
      https.get(imageUrl, (res) => {
        res.pipe(file);
        file.on("finish", async () => {
          await message.reply({
            body: `🎨✨ 𝑷𝒊𝒙𝒂𝒓𝒂𝒊 𝑨𝑰 𝑰𝒎𝒂𝒈𝒆 ✨🎨\n\n📝 Prompt : ${prompt}`,
            attachment: fs.createReadStream(filePath)
          });
        });
      });

    } catch (error) {
      console.error("Erreur Pixarai :", error);
      await message.reply("❌ Une erreur est survenue lors de la génération de l'image.");
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
