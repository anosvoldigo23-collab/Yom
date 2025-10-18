const ax = require("axios"); // Pour les requêtes HTTP
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix
const apiUrl = "http://65.109.80.126:20409/aryan/font";

module.exports = {
  config: {
    name: "font",
    aliases: ["ft"],
    version: "0.0.3",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "Générateur de texte stylisé",
    longDescription: "Génère du texte stylisé avec différents styles de police.",
    guide: {
      en: "font list\nfont <number> <text>"
    },
    noPrefix: true
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage(
        "❌ | Veuillez fournir des arguments.\nUtilisez :\nfont list\nfont <numéro> <texte>",
        event.threadID,
        event.messageID
      );
    }

    let styles = [];
    try {
      const r = await ax.get(apiUrl);
      styles = r.data.available_styles || [];
    } catch {
      return api.sendMessage(
        "❌ | Échec de la récupération des styles de police depuis l'API.",
        event.threadID,
        event.messageID
      );
    }

    if (args[0].toLowerCase() === "list") {
      let msg = "📜 | Styles de police disponibles :\n\n";
      styles.forEach((style, i) => {
        msg += `${i + 1}. ${style}\n`;
      });
      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err) setTimeout(() => api.unsendMessage(info.messageID), 15000);
      }, event.messageID);
    }

    const index = parseInt(args[0]);
    if (isNaN(index) || index < 1 || index > styles.length) {
      return api.sendMessage(
        "❌ | Numéro de style invalide.\nTapez : font list",
        event.threadID,
        event.messageID
      );
    }

    const style = styles[index - 1];
    const text = args.slice(1).join(" ");
    if (!text) return api.sendMessage(
      "❌ | Veuillez fournir du texte à styliser.",
      event.threadID,
      event.messageID
    );

    try {
      const url = `${apiUrl}?style=${style}&text=${encodeURIComponent(text)}`;
      const r = await ax.get(url);
      const styledText = r.data.result || "❌ Erreur API.";
      return api.sendMessage(styledText, event.threadID, event.messageID);
    } catch {
      return api.sendMessage(
        "❌ | Échec de la récupération du texte stylisé.",
        event.threadID,
        event.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
