const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "mistral",
    aliases: ["mixtral", "mistralai"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "ai",
    shortDescription: { en: "Discuter avec Mistral AI" },
    longDescription: { en: "Parler avec le modèle Mistral AI (Mixtral-8x7B)." },
    guide: { en: "Utilisation: !mistral <message>\nExemple: !mistral qui es-tu" },
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
  },

  onStart: async function({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return api.sendMessage(
        "⚠ Veuillez fournir un message pour commencer à discuter.\nExemple: !mistral qui es-tu",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://arychauhann.onrender.com/api/heurist", {
        params: { prompt, model: "mistralai/mixtral-8x7b-instruct" }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Mistral AI n'a pas renvoyé de réponse.", event.threadID, event.messageID);
      }

      const { result } = response.data;

      const formattedAnswer = `
╔══════════════════════
║ 🤖 𝐌𝐢𝐬𝐭𝐫𝐚𝐥 𝐀𝐈
╠══════════════════════
${result}
╚══════════════════════
      `.trim();

      api.sendMessage(formattedAnswer, event.threadID, (err) => {
        if (err) return;
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Une erreur s'est produite lors de la communication avec Mistral AI.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
