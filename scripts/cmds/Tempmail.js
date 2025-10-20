const axios = require("axios");

module.exports = {
  config: {
    name: "anonymmail",
    aliases: ["mailtemp", "tempmail"],
    version: "1.0",
    author: "Christus x Aryan",
    countDown: 5,
    role: 0,
    shortDescription: "📨 Génère une adresse e-mail temporaire anonyme",
    longDescription: "Crée une adresse mail temporaire via l'API d'Aryan Chauhan.",
    category: "🛠️ UTILITAIRES",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://arychauhann.onrender.com/api/anonymmail");

      if (res.data && res.data.email) {
        const email = res.data.email;

        const message = `
╔═══════════════════════
║ 📬 𝑴𝒂𝒊𝒍 𝑻𝒆𝒎𝒑𝒐𝒓𝒂𝒊𝒓𝒆 𝑨𝒏𝒐𝒏𝒚𝒎𝒆
╠═══════════════════════
║ ✉️  𝐄𝐦𝐚𝐢𝐥 : ${email}
║ ⏰  Utilise-la temporairement pour recevoir des messages sans ta vraie adresse.
╚═══════════════════════
        `;

        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage(
          "⚠️ Impossible de générer une adresse mail temporaire pour le moment.",
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Une erreur est survenue lors de la connexion à l'API AnonymMail.",
        event.threadID,
        event.messageID
      );
    }
  }
};
