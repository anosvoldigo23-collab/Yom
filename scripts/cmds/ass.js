const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "ass",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🍑 Envoie une image aléatoire d'ass",
    longDescription: "Envoie une image aléatoire de type ass depuis l'API WaifuSM.",
    category: "nsfw",
    guide: "{pn}",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ message }) {
    try {
      await message.reply({
        body: "🍑 Voici une image aléatoire :",
        attachment: await global.utils.getStreamFromURL("https://archive.lick.eu.org/api/waifusm/ass")
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ Une erreur est survenue en récupérant l'image.");
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
