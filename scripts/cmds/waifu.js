const axios = require('axios');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "waifu",
    aliases: ["waifu", "neko"],
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "anime",
    shortDescription: "💠 Obtiens une image waifu aléatoire",
    longDescription: "Envoie une image d'animé waifu ou neko aléatoire (ou d'une catégorie spécifique).",
    guide: `{pn} [catégorie]
    
Catégories disponibles : waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe`,
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args }) {
    const categorie = args.join(" ") || "waifu";
    const apiUrl = `https://api.waifu.pics/sfw/${categorie}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.url) throw new Error("Image non disponible");

      message.reply({
        body: `╭─💠 𝗪𝗮𝗶𝗳𝘂 💠─╮\n🎴 Catégorie : ${categorie}\n╰─────────────────╯`,
        attachment: await global.utils.getStreamFromURL(data.url)
      });
    } catch (err) {
      message.reply(`🥺 Oups, la catégorie '${categorie}' est introuvable ou aucune image disponible.\n\nCatégories valides : waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe`);
    }
  }
};

// ⚡ Activation NOPREFIX
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
