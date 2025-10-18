const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "edit",
    version: "1.1",
    author: "Christus",
    role: 0,
    category: "AI-IMAGE",
    shortDescription: { fr: "🖌️ Modifier une image avec un prompt" },
    longDescription: { fr: "Modifie une image téléchargée en fonction de votre prompt avec l'IA." },
    guide: { fr: "Répondez à une image avec : edit [prompt]" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠ Veuillez répondre à une photo avec votre prompt pour la modifier.");
    }

    api.setMessageReaction("🛠️", event.messageID, () => {}, true);

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);

    try {
      const imgURL = repliedImage.url;
      const apiURL = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;
      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      message.reply({
        body: `✅ Image modifiée avec succès pour le prompt : "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error("Erreur EDIT :", err);
      message.reply("❌ Échec de la modification de l'image. Veuillez réessayer plus tard.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);

    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
