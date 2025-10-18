const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "carbonne",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "maker",
    shortDescription: "🖤 Génère une image Carbonne à partir d'un texte",
    longDescription: "Envoie directement une image avec le texte transformé en style 'Carbonne'.",
    guide: "{pn} <texte>",
    noPrefix: true // Activation noprefix
  },

  onStart: async function({ message, args }) {
    if (!args[0])
      return message.reply("❌ Veuillez entrer un texte pour générer l'image Carbonne.");

    const text = args.join("+");
    const imageUrl = `https://archive.lick.eu.org/api/maker/carbonify?text=${text}`;

    const replyMessage = {
      body: `🖤════════════════════🖤\nVoici ton image Carbonne pour :\n\n"${args.join(" ")}"\n🖤════════════════════🖤`,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    };

    return message.reply(replyMessage);
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
