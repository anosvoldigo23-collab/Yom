const FastSpeedtest = require('fast-speedtest-api');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "speed",
    aliases: ["speedtest"],
    version: "1.0",
    author: "Christus",
    countDown: 30,
    role: 2, // réservé au propriétaire/admin
    category: "propriétaire",
    shortDescription: "📶 Teste la vitesse Internet du système",
    longDescription: "Mesure la vitesse de connexion Internet du serveur où le bot est hébergé.",
    guide: "{pn} → Lance un test de vitesse",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args, event }) {
    try {
      const speedTest = new FastSpeedtest({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: FastSpeedtest.UNITS.Mbps
      });

      message.reply("🚀 Lancement du test de vitesse, patientez...");

      const vitesse = await speedTest.getSpeed();

      const resultMsg = `┌─📡 𝗦𝗽𝗲𝗲𝗱𝗧𝗲𝘀𝘁 ──────────┐
💾 Vitesse de téléchargement : ${vitesse} Mbps
└─────────────────────────┘`;

      message.reply(resultMsg);

    } catch (err) {
      console.error("❌ Erreur lors du test de vitesse :", err);
      message.reply("⚠️ Une erreur est survenue pendant le test de vitesse.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
