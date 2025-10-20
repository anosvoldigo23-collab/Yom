const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "tripplanner",
    version: "1.1",
    author: "Christus",
    countDown: 3,
    role: 0,
    category: "Travel 🌍",
    shortDescription: { fr: "✈️ Planifie ton voyage facilement" },
    longDescription: { fr: "Obtiens des suggestions de voyage personnalisées avec Copilot2Trip, directement sans préfixe." },
    guide: { fr: "Écris ta demande de voyage directement." },
    noPrefix: true // Activation NOPREFIX
  },

  onStart: async function ({ message, event }) {
    try {
      const prompt = event.body;
      if (!prompt) return;

      const apiURL = `https://arychauhann.onrender.com/api/copilot2trip?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.result) {
        return message.reply("❌ L'API Copilot n'a pas pu générer de réponse.");
      }

      const response = data.result.trim();

      const formattedMsg = `
🌴════════════════🌴
       ✈️ 𝐓𝐫𝐢𝐩 𝐏𝐥𝐚𝐧𝐧𝐞𝐫 ✈️
🌴════════════════🌴

📝 𝐓𝐚 𝐝𝐞𝐦𝐚𝐧𝐝𝐞 :
"${prompt}"

🌍 𝐑𝐞́𝐬𝐮𝐥𝐭𝐚𝐭 :
${response}

🌴════════════════🌴`;

      await message.reply(formattedMsg);
    } catch (error) {
      console.error(error);
      await message.reply("⚠️ Erreur de connexion à l'API Copilot2Trip.");
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
