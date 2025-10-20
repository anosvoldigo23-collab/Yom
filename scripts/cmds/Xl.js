const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "xl",
    aliases: ["xlimg", "genimg"],
    version: "1.0",
    author: "Christus & GPT",
    countDown: 5,
    role: 0,
    shortDescription: "Génère une image avec XL 🧠🖼️",
    longDescription: "Utilise l'API XL pour générer une image à partir d'un prompt.",
    category: "image",
    guide: {
      vi: "{pn} <prompt>",
      en: "{pn} <prompt>"
    }
  },

  onStart: async function({ event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Veuillez entrer une description pour générer une image.");
    }

    try {
      const url = `https://arychauhann.onrender.com/api/xl?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url);

      if (res.data && res.data.status === "success" && res.data.url) {
        const imageUrl = res.data.url;
        const imgPath = path.join(__dirname, `cache/xl_${Date.now()}.png`);

        // Téléchargement de l'image
        const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

        // Envoi de l'image
        await message.reply({
          body: `🧠 Image générée pour : ${prompt}`,
          attachment: fs.createReadStream(imgPath)
        });

        // Nettoyage du fichier après envoi
        fs.unlinkSync(imgPath);
      } else {
        return message.reply("⚠️ Impossible de générer l'image avec XL.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue lors de la génération de l'image.");
    }
  }
};
