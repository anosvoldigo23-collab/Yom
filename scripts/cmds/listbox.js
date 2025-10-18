const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "listbox",
    version: "1.0.1",
    author: "Christus x Aesther",
    role: 2,
    countDown: 10,
    category: "system",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Liste tous les groupes dans lesquels le bot est présent" },
    longDescription: { en: "Affiche tous les noms de groupes et leurs identifiants (Thread ID) où le bot est membre." },
    guide: { en: "Répond au message pour voir la liste complète des groupes." }
  },

  onStart: async function({ api, event }) {
    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(t => t.isGroup && t.name && t.threadID);

      if (!groupThreads.length) {
        return api.sendMessage("❌ 𝐀𝐮𝐜𝐮𝐧 𝐠𝐫𝐨𝐮𝐩𝐞 𝐭𝐫𝐨𝐮𝐯é.", event.threadID, event.messageID);
      }

      let msg = `╔═════════════════════════\n`;
      msg += `║ 🎯 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐞𝐬 : ${groupThreads.length}\n`;
      msg += `╠═════════════════════════\n`;

      groupThreads.forEach((group, index) => {
        msg += `║ 📦 𝐆𝐫𝐨𝐮𝐩𝐞 ${index + 1}\n`;
        msg += `║ 📌 𝐍𝐨𝐦 : ${group.name}\n`;
        msg += `║ 🆔 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃 : ${group.threadID}\n`;
        msg += `╠═════════════════════════\n`;
      });

      msg += `║ 👀 𝐋𝐢𝐬𝐭𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞 ✅\n`;
      msg += `╚═════════════════════════`;

      await api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      return api.sendMessage(
        `⚠ 𝐄𝐫𝐫𝐞𝐮𝐫 𝐥𝐨𝐫𝐬 𝐝𝐞 𝐥𝐚 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐞 𝐥𝐚 𝐥𝐢𝐬𝐭𝐞 𝐝𝐞𝐬 𝐠𝐫𝐨𝐮𝐩𝐞𝐬:\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
