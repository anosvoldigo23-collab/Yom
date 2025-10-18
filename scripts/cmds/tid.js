const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "tid",
    version: "1.3",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: "🆔 Affiche l'ID du groupe",
    longDescription: "Permet de voir rapidement le threadID du groupe où la commande est utilisée.",
    guide: "{pn} → affiche l'ID du groupe",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ message, event }) {
    const tid = event.threadID;
    const resultMsg = `
┌─🆔 𝗧𝗵𝗿𝗲𝗮𝗱 𝗜𝗗 ─────────────┐
│ 💬 ID du groupe : ${tid}
└─────────────────────────────┘
`.trim();
    message.reply(resultMsg);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
