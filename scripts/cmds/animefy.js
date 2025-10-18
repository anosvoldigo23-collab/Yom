const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "animefy",
    version: "1.0",
    author: "Christus",
    countDown: 10,
    role: 0,
    longDescription: "Convertit une image en style anime grâce à Animefy AI.",
    category: "image",
    guide: "{pn} répondre à une image [prompt] [genre] [largeur hauteur]",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) return;

    const originalUrl = event.messageReply.attachments[0].url;

    const prompt = args[0] || "Un magnifique personnage anime";
    const gender = args[1] && ["men", "women"].includes(args[1].toLowerCase()) ? args[1].toLowerCase() : "men";
    const width = args[2] && !isNaN(args[2]) ? parseInt(args[2]) : 768;
    const height = args[3] && !isNaN(args[3]) ? parseInt(args[3]) : 768;

    const apiUrl = `https://arychauhann.onrender.com/api/animefy?imageUrl=${encodeURIComponent(originalUrl)}&prompt=${encodeURIComponent(prompt)}&gender=${gender}&width=${width}&height=${height}`;

    const w = await api.sendMessage("🎨 Génération de votre image style anime... Veuillez patienter.", event.threadID);

    try {
      const { data } = await axios.get(apiUrl);

      if (!data || !data.imageUrl) {
        await api.unsendMessage(w.messageID);
        return api.sendMessage("❌ Échec de la génération de l'image style anime. L'API n'a retourné aucun résultat.", event.threadID);
      }

      const filePath = path.join(__dirname, `animefy_${Date.now()}.png`);
      const imgRes = await axios.get(data.imageUrl, { responseType: "arraybuffer" });
      await fs.outputFile(filePath, imgRes.data);

      await api.unsendMessage(w.messageID);
      await api.sendMessage({
        body: `✅ Voici votre image style anime ! 🌸\nPrompt : ${prompt}\nGenre : ${gender}\nTaille : ${width}x${height}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, event.messageID);

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("animefy.onStart erreur :", error?.response?.data || error.message);
      await api.sendMessage("❌ Une erreur est survenue lors de la génération de votre image style anime. Veuillez réessayer plus tard.", event.threadID, event.messageID);
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
