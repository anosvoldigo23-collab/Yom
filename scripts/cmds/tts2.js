const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Liste des modèles TTS disponibles
const models = [
  "Zeina","Nicole","Russell","Ricardo","Camila","Vitoria","Brian","Amy","Emma","Chantal",
  "Enrique","Lucia","Conchita","Zhiyu","Naja","Mads","Ruben","Lotte","Mathieu","Celine",
  "Lea","Vicki","Marlene","Hans","Karl","Dora","Aditi","Raveena","Giorgio","Carla","Bianca",
  "Takumi","Mizuki","Seoyeon","Mia","Liv","Jan","Maja","Ewa","Jacek","Cristiano","Ines",
  "Carmen","Tatyana","Maxim","Astrid","Filiz","Kimberly","Ivy","Kendra","Justin","Joey",
  "Matthew","Salli","Joanna","Penelope","Lupe","Miguel","Gwyneth","Geraint"
];

module.exports = {
  config: {
    name: "tts",
    version: "1.2",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "audio",
    shortDescription: "🔊 Transforme ton texte en voix avec IA",
    longDescription: "Génère un fichier audio TTS à partir de ton texte avec la voix d'un modèle IA",
    guide: "{pn} <texte> | <modèle>\nEx : {pn} Salut tout le monde | Nicole",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ args, message, event }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return message.reply(`❌ Utilisation :\n${this.config.guide}`);
    }

    // Parse input texte | modèle
    const input = args.join(" ").split("|").map(e => e.trim());
    const text = input[0] || "Salut !";
    const model = input[1] || "Nicole";

    if (!models.includes(model)) {
      return message.reply(`❌ Modèle invalide !\nModèles disponibles :\n${models.join(", ")}`);
    }

    const apiUrl = `https://archive.lick.eu.org/api/ai/tts-mp3?text=${encodeURIComponent(text)}&model=${encodeURIComponent(model)}`;
    const tempPath = path.join(__dirname, `tts_${Date.now()}.mp3`);

    try {
      const waitMsg = await message.reply("🔊✨ Génération de la voix en cours... Patiente un instant ✨🔊");

      const response = await axios.get(apiUrl);
      const audioUrl = response.data.result.audio_url;

      // Télécharger le fichier audio
      const audioRes = await axios.get(audioUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.dirname(tempPath));
      fs.writeFileSync(tempPath, audioRes.data);

      await message.reply({
        body: `┌─🔊 𝗧𝗧𝗦 𝗠𝗔𝗞𝗘𝗥 ───────────┐\n💬 Texte : ${text}\n🗣️ Modèle : ${model}\n✅ Voix générée avec succès !\n└─────────────────────┘`,
        attachment: fs.createReadStream(tempPath)
      });

      // Supprimer le message d'attente et le fichier temporaire
      await message.unsend(waitMsg.messageID);
      fs.unlinkSync(tempPath);

    } catch (err) {
      console.error("Erreur TTS :", err);
      return message.reply("❌ Une erreur est survenue lors de la génération du TTS.", threadID, messageID);
    }
  }
};

// 🟢 Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
