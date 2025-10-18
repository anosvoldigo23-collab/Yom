const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "lyrics",
    version: "1.2",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "search",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "🎵 Récupérer les paroles d'une chanson",
    longDescription: "Obtenir les paroles détaillées d'une chanson avec le titre, l'artiste et la pochette",
    guide: "{pn} <nom de la chanson>\nEx : {pn} apt"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(`⚠️ Veuillez fournir le nom d'une chanson !\nExemple : ${this.config.guide}`, event.threadID, event.messageID);
    }

    try {
      const { data } = await axios.get(`https://lyricstx.vercel.app/youtube/lyrics?title=${encodeURIComponent(query)}`);

      if (!data?.lyrics) {
        return api.sendMessage("❌ Paroles non trouvées.", event.threadID, event.messageID);
      }

      const { artist_name, track_name, artwork_url, lyrics } = data;
      const imgPath = path.join(__dirname, `lyrics_${Date.now()}.jpg`);

      // Récupération de l'image
      const imgResp = await axios.get(artwork_url, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      imgResp.data.pipe(writer);

      writer.on("finish", () => {
        const caption = `
╔══════════════════════════
║ 🎼 𝗟𝗬𝗥𝗜𝗖𝗦
╠══════════════════════════
║ 🎵 Titre : ${track_name}
║ 👤 Artiste : ${artist_name}
╠══════════════════════════
${lyrics}
╚══════════════════════════
        `.trim();

        api.sendMessage({
          body: caption,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
      });

      writer.on("error", () => {
        const caption = `
🎵 Titre : ${track_name}
👤 Artiste : ${artist_name}

${lyrics}
        `.trim();

        api.sendMessage(caption, event.threadID, event.messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Erreur : Impossible de récupérer les paroles. Veuillez réessayer plus tard.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
