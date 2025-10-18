const fsp = require('fs').promises;
const g = require('fca-aryan-nix'); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "file",
    version: "1.1.0",
    author: "Christus",
    role: 2,
    shortDescription: "Envoie le contenu brut d'un fichier depuis scripts/cmds",
    longDescription: "Permet de visualiser le code source brut d'un fichier du dossier scripts/cmds",
    category: "utilitaire",
    guide: { fr: "[nomDuFichier]" },
    countDown: 1,
    noPrefix: true
  },

  onStart: async function({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage(
        "[⚜]➜ Veuillez fournir le nom du fichier.",
        event.threadID,
        event.messageID
      );
    }

    const fileName = args[0];
    const filePath = `scripts/cmds/${fileName}.js`;

    try {
      const content = await fsp.readFile(filePath, "utf8");

      // Limite de caractères pour Messenger
      if (content.length > 19000) {
        return api.sendMessage(
          "[⚜]➜ Fichier trop volumineux pour être affiché.",
          event.threadID,
          event.messageID
        );
      }

      await api.sendMessage(`📄 Contenu de "${fileName}.js":\n\`\`\`js\n${content}\n\`\`\``, event.threadID, event.messageID);

    } catch (err) {
      console.error("Erreur file noprefix :", err);
      api.sendMessage(
        "[⚜]➜ Fichier introuvable ou impossible à lire.",
        event.threadID,
        event.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
