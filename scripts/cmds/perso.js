const axios = require("axios");

const characters = {
  zoro: {
    name: "Zoro",
    emoji: "🗡️",
    api: "https://arychauhann.onrender.com/api/zoro"
  },
  tanjiro: {
    name: "Tanjiro",
    emoji: "🌸",
    api: "https://arychauhann.onrender.com/api/tanjiro"
  },
  gojo: {
    name: "Gojo",
    emoji: "🕶️",
    api: "https://arychauhann.onrender.com/api/gojo"
  },
  nezuko: {
    name: "Nezuko",
    emoji: "🎀",
    api: "https://arychauhann.onrender.com/api/nezuko"
  }
};

module.exports = {
  config: {
    name: "perso",
    aliases: ["char", "personnage", "animebot"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Parle avec ton personnage préféré",
    longDescription: "Discuter avec Zoro, Tanjiro, Gojo ou Nezuko via leurs APIs respectives.",
    category: "IA",
    guide: {
      fr: "{pn} <personnage> <texte>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const perso = args[0]?.toLowerCase();
    const prompt = args.slice(1).join(" ");

    if (!perso || !characters[perso])
      return api.sendMessage(
        `❌ Personnage invalide ! Choisis parmi : ${Object.keys(characters).join(", ")}`,
        event.threadID,
        event.messageID
      );

    if (!prompt)
      return api.sendMessage(
        "❌ Veuillez entrer un texte à envoyer au personnage.",
        event.threadID,
        event.messageID
      );

    try {
      const url = `${characters[perso].api}?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      if (res.data && res.data.result) {
        const reply = res.data.result;

        const message = `
╔═══════════════
║ ${characters[perso].emoji} ${characters[perso].name} 
╠═══════════════
║ 💬 Question :
║ ${prompt}
╠═══════════════
║ 📝 Réponse :
║ ${reply}
╚═══════════════
        `;

        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage(
          `⚠️ Impossible d'obtenir une réponse de ${characters[perso].name}.`,
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      api.sendMessage(
        `❌ Une erreur est survenue lors de la connexion à l'API ${characters[perso].name}.`,
        event.threadID,
        event.messageID
      );
      console.error(err);
    }
  }
};
