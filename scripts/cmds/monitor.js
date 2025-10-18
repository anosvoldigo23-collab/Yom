const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "monitor",
    version: "1.1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "system",
    shortDescription: { en: "Créer ou renommer un moniteur de disponibilité" },
    longDescription: { en: "Créer un moniteur UptimeRobot ou renommer un existant" },
    guide: { en: "{p}monitor [nom] [url]\n{p}monitor rename [id] [nouveauNom]" },
    usePrefix: false, // Désactive le préfixe
    noPrefix: true    // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length < 1) {
      return api.sendMessage("❌ Utilisation:\n{p}monitor [nom] [url]\n{p}monitor rename [id] [nouveauNom]", threadID, messageID);
    }

    const subCommand = args[0].toLowerCase();

    // === Renommer le moniteur ===
    if (subCommand === "rename") {
      if (args.length < 3) {
        return api.sendMessage("❌ Utilisation:\n{p}monitor rename [id] [nouveauNom]", threadID, messageID);
      }

      const id = args[1];
      const newName = args.slice(2).join(" ");

      try {
        const res = await axios.get("https://web-api-delta.vercel.app/upt/rename", { params: { id, name: newName } });
        const result = res.data;

        if (result.error) return api.sendMessage(`⚠️ Échec du renommage : ${result.error}`, threadID, messageID);

        const updated = result.data;
        const msg = `
✅ Moniteur renommé !
━━━━━━━━━━━━━━
🆔 ID : ${updated.id}
📛 Nouveau nom : ${updated.name}
        `.trim();
        return api.sendMessage(msg, threadID, messageID);
      } catch (e) {
        return api.sendMessage(`🚫 La requête API a échoué !\n${e.message}`, threadID, messageID);
      }
    }

    // === Créer un moniteur ===
    if (args.length < 2) return api.sendMessage("❌ Utilisation:\n{p}monitor [nom] [url]", threadID, messageID);

    const name = args[0];
    const url = args[1];
    const interval = 300;

    if (!url.startsWith("http")) return api.sendMessage("❌ Veuillez fournir une URL valide !", threadID, messageID);

    try {
      const res = await axios.get("https://web-api-delta.vercel.app/upt", { params: { name, url, interval } });
      const result = res.data;

      if (result.error) return api.sendMessage(`⚠️ Erreur : ${result.error}`, threadID, messageID);

      const monitor = result.data;
      const msg = `
✅ Moniteur créé avec succès !
━━━━━━━━━━━━━━
🆔 ID : ${monitor.id}
📛 Nom : ${monitor.name}
🔗 URL : ${monitor.url}
⏱️ Intervalle : ${monitor.interval / 60} min
📶 Statut : ${monitor.status == 1 ? "Actif ✅" : "Inactif ❌"}
      `.trim();
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`🚫 La requête API a échoué !\n${e.message}`, threadID, messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
