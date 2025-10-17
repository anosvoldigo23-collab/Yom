const axios = require("axios");
const fs = require("fs");
const path = require("path");

const apiUrl = "http://65.109.80.126:20409/aryan/4k";

module.exports = {
  config: {
    name: "4k",
    aliases: ["amelioration"],
    version: "1.1",
    role: 0,
    author: "Christus",
    countDown: 10,
    longDescription: "Améliore la résolution des images jusqu'à 4K.",
    category: "image",
    guide: {
      fr: "${pn} répond à une image pour l'améliorer en résolution 4K."
    }
  },

  onStart: async function ({ message, event }) {
    // Vérification si l'utilisateur a répondu à une image
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("📸 Veuillez répondre à une image pour l'améliorer.");
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const filePath = path.join(__dirname, "cache", `upscaled_${Date.now()}.png`);
    let messageId;

    try {
      const responseMessage = await message.reply("🔄 Traitement de votre image, veuillez patienter...");
      messageId = responseMessage.messageID;

      const apiResponse = await axios.get(`${apiUrl}?imageUrl=${encodeURIComponent(imageUrl)}`);
      if (!apiResponse.data.status) throw new Error(apiResponse.data.message || "Erreur API");

      const enhancedImage = await axios.get(apiResponse.data.enhancedImageUrl, { responseType: "stream" });
      const writeStream = fs.createWriteStream(filePath);
      enhancedImage.data.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      await message.reply({
        body: "✅ Votre image améliorée en 4K est prête !",
        attachment: fs.createReadStream(filePath),
      });
    } catch (error) {
      console.error("Erreur d'amélioration :", error);
      message.reply("❌ Une erreur est survenue lors de l'amélioration de l'image. Veuillez réessayer plus tard.");
    } finally {
      if (messageId) message.unsend(messageId);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};