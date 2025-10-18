const axios = require('axios');
const g = require('fca-aryan-nix'); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "prompt",
    aliases: ['p'],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "𝗔𝗜",
    shortDescription: "𝐺𝐞́𝐧𝐞̀𝐫𝐞 𝐮𝐧𝐞 𝐢𝐧𝐯𝐢𝐭𝐞 𝐝'𝐈𝐀",
    longDescription: "𝐺𝐞́𝐧𝐞̀𝐫𝐞 𝐮𝐧𝐞 𝐢𝐧𝐯𝐢𝐭𝐞 𝐌𝐢𝐝𝐣𝐨𝐮𝐫𝐧𝐞𝐲 𝐛𝐚𝐬𝐞́𝐞 𝐬𝐮𝐫 𝐮𝐧 𝐭𝐞𝐱𝐭𝐞 𝐨𝐮 𝐮𝐧𝐞 𝐢𝐦𝐚𝐠𝐞.",
    guide: {
      en: "📌 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧:\n"
        + "{n} <texte> → Génère une invite basée sur le texte.\n"
        + "{n} (répondre à une image) → Génère une invite basée sur l'image."
    },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, event, args }) {
    try {
      let imageUrl;

      // Si on répond à une image
      if (event.type === "message_reply" && event.messageReply.attachments[0]?.type === 'photo') {
        imageUrl = event.messageReply.attachments[0].url;
      }

      // Si on a du texte
      const promptText = args.join(" ");

      if (!promptText && !imageUrl) {
        return message.reply("❌ 𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐟𝐨𝐮𝐫𝐧𝐢𝐫 𝐮𝐧 𝐭𝐞𝐱𝐭𝐞 𝐨𝐮 𝐫𝐞́𝐩𝐨𝐧𝐝𝐫𝐞 𝐚̀ 𝐮𝐧𝐞 𝐢𝐦𝐚𝐠𝐞.");
      }

      let apiUrl;
      if (imageUrl) {
        apiUrl = `https://nova-apis.onrender.com/prompt?image=${encodeURIComponent(imageUrl)}`;
      } else {
        apiUrl = `https://nova-apis.onrender.com/prompt?prompt=${encodeURIComponent(promptText)}`;
      }

      const response = await axios.get(apiUrl);
      if (response.status === 200 && response.data.prompt) {
        return message.reply(
          `╔═══════════════\n` +
          `║ 𝐏𝐫𝐨𝐦𝐩𝐭 𝐆𝐞́𝐧𝐞́𝐫𝐞́\n` +
          `╠═══════════════\n` +
          `║ ${response.data.prompt}\n` +
          `╚═══════════════`
        );
      } else {
        return message.reply("❌ 𝐄́𝐜𝐡𝐞𝐜 𝐝𝐞 𝐠𝐞́𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐮 𝐩𝐫𝐨𝐦𝐩𝐭. 𝐑𝐞𝐞𝐬𝐬𝐚𝐲𝐞𝐳 plus tard.");
      }

    } catch (error) {
      console.error("Erreur lors de la génération du prompt:", error);
      return message.reply("❌ 𝐔𝐧𝐞 𝐞𝐫𝐫𝐞𝐮𝐫 s'est produite. Veuillez réessayer plus tard.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
