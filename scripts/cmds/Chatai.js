const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "chatai",
    version: "1.1",
    author: "Christus ✨",
    countDown: 3,
    role: 0,
    category: "AI 🤖",
    shortDescription: { fr: "💬 Discuter avec GPT-4.1 Nano" },
    longDescription: { fr: "Parle directement avec le modèle GPT-4.1 Nano sans préfixe." },
    guide: { fr: "Écris simplement ta question sans préfixe." },
    noPrefix: true // Activation NOPREFIX
  },

  onStart: async function ({ message, event }) {
    try {
      const prompt = event.body;
      if (!prompt) return;

      const apiURL = `https://arychauhann.onrender.com/api/chatai?prompt=${encodeURIComponent(prompt)}&model=1`;
      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.success || !data.response) {
        return message.reply("❌ GPT-4.1 Nano n'a pas pu générer de réponse.");
      }

      const response = data.response.trim();

      const formattedMsg = `
✨━━━━━━━━━━━━━━━━━━━━✨
      💻 𝐂𝐡𝐚𝐭𝐀𝐈
      GPT-4.1 Nano
✨━━━━━━━━━━━━━━━━━━━━✨

📝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧 :
"${prompt}"

🤖 𝐑𝐞́𝐩𝐨𝐧𝐬𝐞 :
"${response}"

✨━━━━━━━━━━━━━━━━━━━━✨`;

      await message.reply(formattedMsg);
    } catch (error) {
      console.error(error);
      await message.reply("⚠️ Erreur de connexion à l'API ChatAI.");
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
