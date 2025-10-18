const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");
const g = require("fca-aryan-nix"); // Pour noprefix

module.exports = {
  config: {
    name: "xnxx",
    version: "2.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    shortDescription: "🔞 Rechercher et télécharger des vidéos xnxx avec style",
    longDescription: "Recherche des vidéos xnxx et télécharge en qualité faible, élevée ou HLS avec prévisualisation des miniatures.",
    category: "nsfw",
    guide: "{pn} <recherche>",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("❌ | Veuillez fournir une recherche", event.threadID, event.messageID);
    let query = encodeURIComponent(args.join(" "));
    try {
      let res = await axios.get(`https://aryanapi.up.railway.app/api/xnxxsearch?query=${query}`);
      let data = res.data;
      let list = Object.keys(data).filter(k => !isNaN(k)).slice(0, 6).map(k => data[k]);
      if (!list.length) return api.sendMessage("⚠ | Aucun résultat trouvé pour votre recherche", event.threadID, event.messageID);

      let msg = `🔞 ── Résultats pour : ${args.join(" ")} ──\n\n`;
      list.forEach((vid, i) => {
        msg += `${i + 1}. ${vid.title}\n👤 ${vid.uploader || "Inconnu"}\n👁️ ${vid.views} | ⏱️ ${vid.duration}\n🔗 ${vid.link}\n\n`;
      });

      msg += "🎯 Répondez avec 1-6 pour choisir une vidéo ou 'cancel' pour annuler.";

      api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            stage: "chooseVideo",
            author: event.senderID,
            results: list
          });
        },
        event.messageID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ | Erreur lors de la récupération des résultats", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;
    const cancelMsg = "❌ | Action annulée par l'utilisateur.";

    // Étape 1 : Choix de la vidéo
    if (Reply.stage === "chooseVideo") {
      if (event.body.toLowerCase() === "cancel") return api.sendMessage(cancelMsg, event.threadID, event.messageID);
      let choice = parseInt(event.body);
      if (isNaN(choice) || choice < 1 || choice > Reply.results.length) 
        return api.sendMessage("⚠ | Choix invalide. Répondez avec 1-6 ou 'cancel'.", event.threadID, event.messageID);

      let vid = Reply.results[choice - 1];
      api.sendMessage(
        {
          body: `📹 Vidéo sélectionnée : ${vid.title}\n⏱️ ${vid.duration}\n👤 ${vid.uploader || "Inconnu"}\n\n` +
                "Répondez avec :\n1️⃣ Qualité faible\n2️⃣ Qualité élevée\n3️⃣ Qualité HLS\n❌ cancel pour annuler",
          attachment: fs.createReadStream(await downloadThumbnail(vid.thumbnail, event.senderID))
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            stage: "chooseQuality",
            author: Reply.author,
            video: vid
          });
        },
        event.messageID
      );
    }

    // Étape 2 : Choix de la qualité
    else if (Reply.stage === "chooseQuality") {
      if (event.body.toLowerCase() === "cancel") return api.sendMessage(cancelMsg, event.threadID, event.messageID);
      let qual = parseInt(event.body);
      if (![1, 2, 3].includes(qual)) return api.sendMessage("⚠ | Choix invalide. Répondez avec 1, 2, 3 ou 'cancel'.", event.threadID, event.messageID);

      let vid = Reply.video;
      try {
        let res = await axios.get(`https://aryanapi.up.railway.app/api/xnxxdl?url=${encodeURIComponent(vid.link)}`);
        let data = res.data;
        if (!data.status) return api.sendMessage("❌ | Échec du téléchargement", event.threadID, event.messageID);

        let fileURL = qual === 1 ? data.files.low : qual === 2 ? data.files.high : data.files.hls;
        let filePath = path.join(__dirname, `cache/${event.senderID}_video.mp4`);

        await new Promise(resolve => request(fileURL).pipe(fs.createWriteStream(filePath)).on("close", resolve));

        api.sendMessage(
          {
            body: `📹 ${data.title}\n⏱️ ${data.duration}s\n👤 ${data.info}\n💾 Qualité : ${qual === 1 ? "Faible" : qual === 2 ? "Élevée" : "HLS"}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );

      } catch (e) {
        console.error(e);
        api.sendMessage("❌ | Erreur lors du téléchargement de la vidéo", event.threadID, event.messageID);
      }
    }
  }
};

// Fonction utilitaire pour télécharger le thumbnail
async function downloadThumbnail(url, senderID) {
  const filePath = path.join(__dirname, `cache/${senderID}_thumb.jpg`);
  const writer = fs.createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(writer)
      .on("finish", () => resolve(filePath))
      .on("error", reject);
  });
}

// ⚡ Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
