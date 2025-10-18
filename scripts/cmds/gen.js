const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "gen",
    aliases: ["ai4image"],
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Générer des images IA en utilisant Gen AI" },
    longDescription: { en: "Envoyez une invite textuelle et éventuellement un ratio d'aspect pour générer une image IA en utilisant l'API Christus AI4Image." },
    category: "ai",
    guide: { en: "{pn} <prompt> [--ar=1:1]\n\nExample:\n{pn} cute cat in a garden --ar=16:9" },
    noPrefix: true
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Veuillez fournir une invite pour Gen AI.", event.threadID, event.messageID);

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    let ratio = "1:1";
    const argStr = args.join(" ");
    const arMatch = argStr.match(/--?ar[=\s]+([0-9]+:[0-9]+)/i);
    if (arMatch) ratio = arMatch[1];

    const prompt = argStr.replace(/--?ar[=\s]+([0-9]+:[0-9]+)/i, "").trim();
    if (!prompt) return api.sendMessage("❌ Veuillez fournir une invite valide.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/ai4image?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });
      const imageUrl = res.data?.result?.image_link;

      if (!imageUrl) return api.sendMessage("❌ Échec de la génération de l'image Gen AI.", event.threadID, event.messageID);

      const fileRes = await axios.get(imageUrl, { responseType: "stream" });
      const filename = `genai_${Date.now()}.jpeg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      fileRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `✨ Image Gen AI générée pour l'invite: "${prompt}"\n📐 Ratio: ${ratio}`,
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => {
          try { fs.unlinkSync(filepath); } catch {}
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ Erreur d'écriture du fichier:", err.message);
        api.sendMessage("❌ Erreur lors de l'enregistrement de l'image Gen AI.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Erreur lors de la génération de l'image Gen AI:", err.message);
      api.sendMessage("❌ Échec de la génération de l'image Gen AI.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
