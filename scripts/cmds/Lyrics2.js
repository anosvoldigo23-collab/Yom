const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["paroles", "songlyrics"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎤 Obtiens les paroles complètes d'une chanson",
    longDescription: "Cherche une chanson et affiche toutes les paroles avec les infos détaillées.",
    category: "🎶 MUSIQUE",
    guide: {
      fr: "{pn} <nom de la chanson>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "❌ Veuillez entrer le titre ou un mot-clé de la chanson.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const url = `https://arychauhann.onrender.com/api/lyricsv2?query=${encodeURIComponent(query)}`;
      const res = await axios.get(url);

      if (res.data && res.data.status && res.data.data) {
        const song = res.data.data;

        const message = `
╔═══════════════════════════
║ 🎶  𝑷𝒂𝒓𝒐𝒍𝒆𝒔 𝒅𝒆 𝒄𝒉𝒂𝒏𝒔𝒐𝒏
╠═══════════════════════════
║ 📌 𝐓𝐢𝐭𝐫𝐞 : ${song.title}
║ 👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐞 : ${song.artis}
║ 📅 𝐒𝐨𝐫𝐭𝐢𝐞 : ${song.rilis}
╠═══════════════════════════
║ 📝 𝐏𝐚𝐫𝐨𝐥𝐞𝐬 :
${song.lirik}
╚═══════════════════════════
        `;

        api.sendMessage(
          {
            body: message,
            attachment: await global.utils.getStreamFromURL(song.image)
          },
          event.threadID,
          event.messageID
        );
      } else {
        api.sendMessage(
          "⚠️ Aucune chanson trouvée pour ta recherche.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "❌ Une erreur est survenue lors de la récupération des paroles.",
        event.threadID,
        event.messageID
      );
    }
  }
};
