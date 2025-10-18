const https = require("https");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "cat",
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: { fr: "🐱 Envoie une image aléatoire de chat" },
    longDescription: { fr: "Envoie directement une image aléatoire de chat mignon." },
    guide: { fr: "+cat" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message }) {
    try {
      const url = "https://cataas.com/cat";
      const cachePath = path.join(__dirname, "cache/cat.jpg");

      // Création du dossier cache si inexistant
      await fs.ensureDir(path.join(__dirname, "cache"));

      const file = fs.createWriteStream(cachePath);
      https.get(url, (res) => {
        res.pipe(file);
        file.on("finish", async () => {
          await message.reply({
            body: "🐾══════════════🐾\nVoici un chat aléatoire pour vous !\n🐾══════════════🐾",
            attachment: fs.createReadStream(cachePath)
          });
        });
      });
    } catch (error) {
      console.error(error);
      await message.reply("❌ Une erreur est survenue lors de la récupération de l'image.");
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
