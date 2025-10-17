const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nh",
    aliases: ["doujin"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 2,
    shortDescription: "🔞 Recherche un doujin sur nhentai",
    longDescription: "Permet de rechercher un doujin sur nhentai.net avec aperçu des tags et pages.",
    category: "nsfw",
    guide: {
      fr: "nh [mot-clé]\nEx : nh lisa"
    }
  },

  onStart: async function ({ api, event, args }) {
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

      const info = `📕 𝗧𝗶𝘁𝗿𝗲 : ${data.title}\n🆔 ID : ${data.id}\n🗂️ Catégorie : ${data.categories.join(", ")}\n🧷 Tags : ${data.tags.slice(0, 10).join(", ")}\n📄 Pages : ${data.pages}\n🎭 Parodie : ${data.parodies.join(", ") || "Aucune"}\n🌐 Langue : ${data.languages.join(", ")}\n\n📌 Aperçu des 10 premières pages :`;

      api.sendMessage({
        body: info,
        attachment: imagePaths
      }, event.threadID, async () => {
        await fs.remove(folderPath); // suppression du cache après envoi
      }, event.messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("🚫 Une erreur est survenue pendant la recherche.", event.threadID, event.messageID);
    }
  }
};
