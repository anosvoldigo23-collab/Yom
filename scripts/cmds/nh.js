const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "nh",
    aliases: ["doujin"],
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 2,
    category: "nsfw",
    shortDescription: "🔞 Recherche un doujin sur nhentai",
    longDescription: "Permet de rechercher un doujin sur nhentai.net avec aperçu des tags et pages.",
    guide: { fr: "nh [mot-clé]\nEx : nh lisa" },
    usePrefix: false, // désactive le préfixe
    noPrefix: true    // activation noprefix
  },

  onStart: async function({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("🔍 Veuillez entrer un mot-clé à rechercher.\nEx : nh lisa", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/anime/nhentai?query=${encodeURIComponent(query)}`);
      const data = res.data.data;

      if (!data || !data.images || data.images.length === 0) {
        return api.sendMessage("❌ Aucun résultat trouvé.", event.threadID, event.messageID);
      }

      const folderPath = path.join(__dirname, "cache", `nh-${event.senderID}`);
      await fs.ensureDir(folderPath);

      const firstImages = data.images.slice(0, 10); // max 10 preview
      const imagePaths = [];

      for (let i = 0; i < firstImages.length; i++) {
        const imgRes = await axios.get(firstImages[i], { responseType: "arraybuffer" });
        const imgPath = path.join(folderPath, `page${i + 1}.jpg`);
        fs.writeFileSync(imgPath, imgRes.data);
        imagePaths.push(fs.createReadStream(imgPath));
      }

      const info = `
╔═════════════════════════════
║ 📕 𝗧𝗶𝘁𝗿𝗲 : ${data.title}
║ 🆔 ID : ${data.id}
║ 🗂️ Catégorie : ${data.categories.join(", ")}
║ 🧷 Tags : ${data.tags.slice(0, 10).join(", ")}
║ 📄 Pages : ${data.pages}
║ 🎭 Parodie : ${data.parodies.join(", ") || "Aucune"}
║ 🌐 Langue : ${data.languages.join(", ")}
╠═════════════════════════════
║ 📌 Aperçu des 10 premières pages :
╚═════════════════════════════
      `.trim();

      api.sendMessage({
        body: info,
        attachment: imagePaths
      }, event.threadID, async () => {
        await fs.remove(folderPath); // suppression du cache après envoi
      }, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("🚫 Une erreur est survenue pendant la recherche.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
