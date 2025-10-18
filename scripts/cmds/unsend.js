const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "u",
    version: "1.3",
    author: "NTKhang + Christus",
    countDown: 5,
    role: 0,
    category: "box chat",
    shortDescription: "❌ Supprime un message envoyé par le bot",
    longDescription: "Permet de supprimer un message envoyé par le bot en répondant à celui-ci",
    guide: "{pn} → reply à un message du bot pour le supprimer",
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    vi: {
      syntaxError: "⚠️ Vui lòng reply tin nhắn muốn gỡ của bot"
    },
    en: {
      syntaxError: "⚠️ Please reply the message you want to unsend"
    }
  },

  onStart: async function({ message, event, api, getLang }) {
    const { messageReply } = event;
    if (!messageReply || messageReply.senderID != api.getCurrentUserID()) {
      return message.reply(`┌─⚠️ 𝗘𝗿𝗿𝗲𝘂𝗿 ──────────┐\n${getLang("syntaxError")}\n└───────────────────┘`);
    }

    message.unsend(messageReply.messageID);
    return message.reply(`┌─✅ 𝗦𝘂𝗽𝗽𝗿𝗲𝘀𝘀𝗶𝗼𝗻 ──────────┐\nLe message a été supprimé avec succès !\n└────────────────────────┘`);
  }
};

// 🟢 Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
