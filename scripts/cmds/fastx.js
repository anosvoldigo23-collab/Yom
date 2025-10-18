const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "fastx",
    author: "Christus x Aesther",
    version: "1.3",
    cooldowns: 5,
    role: 0,
    shortDescription: { fr: "Génère 4 images IA et les combine en une grille" },
    longDescription: { fr: "Crée 4 images à partir d'un prompt et les fusionne automatiquement en une seule image." },
    category: "AI-IMAGE",
    guide: { fr: "Réponds à un message ou tape : fastx <prompt> [--ar <ratio>]" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message, args, api, event }) {
    const startTime = Date.now();
    const waitingMsg = await message.reply("⏳ Génération de vos images, veuillez patienter...");

    try {
      let prompt = "";
      let ratio = "1:1";

      // Analyse des arguments pour le prompt et le ratio
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "--ar" && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else {
          prompt += args[i] + " ";
        }
      }
      prompt = prompt.trim();
      if (!prompt) return message.reply("❌ | Veuillez fournir un prompt pour générer les images.");

      const cacheDir = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      // Télécharge les 4 images
      const imageUrls = new Array(4).fill(
        `https://www.ai4chat.co/api/image/generate?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${encodeURIComponent(ratio)}`
      );

      const images = await Promise.all(imageUrls.map(async (url, index) => {
        const { data } = await axios.get(url);
        const imgUrl = data.image_link;
        const imgPath = path.join(cacheDir, `fastx_${index + 1}.jpg`);
        const writer = fs.createWriteStream(imgPath);
        const stream = await axios({ url: imgUrl, method: "GET", responseType: "stream" });
        stream.data.pipe(writer);
        await new Promise((resolve, reject) => { writer.on("finish", resolve); writer.on("error", reject); });
        return imgPath;
      }));

      // Fusionne les images en une grille 2x2
      const loadedImages = await Promise.all(images.map(img => loadImage(img)));
      const width = loadedImages[0].width;
      const height = loadedImages[0].height;
      const canvas = createCanvas(width * 2, height * 2);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(loadedImages[0], 0, 0, width, height);
      ctx.drawImage(loadedImages[1], width, 0, width, height);
      ctx.drawImage(loadedImages[2], 0, height, width, height);
      ctx.drawImage(loadedImages[3], width, height, width, height);

      const combinedImagePath = path.join(cacheDir, `fastx_combined.jpg`);
      fs.writeFileSync(combinedImagePath, canvas.toBuffer("image/jpeg"));

      await api.unsendMessage(waitingMsg.messageID);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const reply = await message.reply({
        body: `✅ | Images générées pour : "${prompt}"\nTemps de génération : ${duration}s\nRéponds avec U1, U2, U3 ou U4 pour voir chaque image individuellement.`,
        attachment: fs.createReadStream(combinedImagePath)
      });

      global.GoatBot.onReply.set(reply.messageID, {
        commandName: this.config.name,
        messageID: reply.messageID,
        images,
        author: event.senderID
      });

    } catch (err) {
      console.error("Erreur Fastx :", err.message);
      await api.unsendMessage(waitingMsg.messageID);
      message.reply("❌ | Échec de la génération des images.");
    }
  },

  onReply: async function ({ message, event, Reply, args }) {
    const replyCmd = args[0]?.toLowerCase();
    const { author, images } = Reply;
    if (event.senderID !== author) return;

    try {
      const valid = ["u1", "u2", "u3", "u4"];
      if (!valid.includes(replyCmd)) return message.reply("❌ | Action invalide. Utilise U1, U2, U3 ou U4.");

      const index = parseInt(replyCmd.slice(1)) - 1;
      await message.reply({ attachment: fs.createReadStream(images[index]) });

    } catch (err) {
      console.error("Erreur onReply Fastx :", err.message);
      message.reply("❌ | Impossible d'envoyer l'image sélectionnée.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
