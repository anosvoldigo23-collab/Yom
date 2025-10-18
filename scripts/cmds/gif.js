const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "gif",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎬 Envoie un GIF aléatoire",
    longDescription: "Permet d'envoyer 1 GIF ou plus depuis Tenor selon le nombre indiqué.",
    category: "fun",
    guide: "{pn} <mot-clé> [nombre]",
    noPrefix: true
  },

  onStart: async function({ message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un mot-clé pour chercher un GIF !");
    
    const query = args[0];
    let count = parseInt(args[1]) || 1; 
    if (count > 5) count = 5;

    try {
      let results = [];

      const res = await axios.get(`https://archive.lick.eu.org/api/search/tenor-gif?query=${query}&count=${count}`);
      if (!res.data || !res.data.results || res.data.results.length === 0) 
        return message.reply("❌ Aucun GIF trouvé pour ce mot-clé.");

      results = res.data.results;

      for (let i = 0; i < results.length; i++) {
        await message.reply({
          body: `✨ GIF ${i + 1} pour : "${query}"\n📝 Alt: ${results[i].alt}`,
          attachment: await global.utils.getStreamFromURL(results[i].gif)
        });
      }

    } catch (e) {
      console.error(e);
      return message.reply("❌ Une erreur est survenue lors de la recherche du GIF.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
