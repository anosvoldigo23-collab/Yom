const axios = require("axios");

module.exports = {
  config: {
    name: "playstore",
    aliases: ["ps", "store", "apksearch"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "📱 Recherche une application sur le Play Store",
    longDescription: "Cherche une appli Android sur le Play Store et affiche les résultats avec lien, note, développeur, etc.",
    category: "🧰 UTILITAIRES",
    guide: {
      fr: "{pn} <nom de l'application>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "❌ Veuillez entrer le nom de l'application à rechercher.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const url = `https://arychauhann.onrender.com/api/playstore?query=${encodeURIComponent(query)}`;
      const res = await axios.get(url);

      if (res.data && res.data.result && res.data.result.length > 0) {
        const apps = res.data.result;

        // On limite à 5 résultats max pour éviter que le message soit trop long
        const topResults = apps.slice(0, 5);

        let message = "╔═══════════════════════════\n";
        message += `║ 📱 𝑹𝒆𝒔𝒖𝒍𝒕𝒂𝒕𝒔 𝑷𝒍𝒂𝒚𝑺𝒕𝒐𝒓𝒆 𝒑𝒐𝒖𝒓 : ${query}\n`;
        message += "╠═══════════════════════════\n";

        const attachments = [];

        for (const app of topResults) {
          message += `\n📌 𝐓𝐢𝐭𝐫𝐞 : ${app.title}\n`;
          message += `👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐩𝐞𝐮𝐫 : ${app.developer}\n`;
          message += `⭐ 𝐍𝐨𝐭𝐞 : ${app.rating}\n`;
          message += `💰 𝐏𝐫𝐢𝐱 : ${app.price}\n`;
          message += `🔗 𝐋𝐢𝐞𝐧 : ${app.link}\n`;
          message += "─────────────────────────────\n";

          attachments.push(await global.utils.getStreamFromURL(app.image));
        }

        message += "╚═══════════════════════════";

        api.sendMessage(
          {
            body: message,
            attachment: attachments
          },
          event.threadID,
          event.messageID
        );
      } else {
        api.sendMessage(
          "⚠️ Aucune application trouvée pour ta recherche.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "❌ Une erreur est survenue lors de la recherche sur le Play Store.",
        event.threadID,
        event.messageID
      );
    }
  }
};
