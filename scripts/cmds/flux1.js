const axios = require("axios");
const fs = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "flux1",
    version: "5.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Générer des images IA ultra-réalistes avec options de style",
    longDescription: "Utilise l'API Flux pour générer des images IA premium avec styles personnalisables",
    category: "IA-IMAGE",
    guide: {
      fr: `{pn} <prompt> | [style]\nExemples:\n• flux un lion dans le désert | réaliste\n• flux guerrière avec épée | anime\n• flux dragon cybernétique | cyberpunk`
    },
    noPrefix: true
  },

  langs: {
    fr: {
      noPrompt: `❗ Veuillez fournir un prompt.\nExemples:\n• flux un lion dans la jungle | réaliste\n• flux dragon sur le toit | fantasy`,
      generating: "🖼️ Génération de votre image IA premium...",
      failed: "❌ Échec de la génération de l'image. Veuillez réessayer plus tard.",
      invalidStyle: "⚠️ Style inconnu fourni ! Le prompt sera utilisé tel quel."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args[0]) return message.reply(getLang("noPrompt"));

    const input = args.join(" ").split("|");
    const rawPrompt = input[0].trim();
    let style = input[1]?.trim().toLowerCase() || "";

    const styleMap = {
      realistic: "photorealiste, ultra-détaillé, 8K UHD, qualité DSLR, éclairage naturel, profondeur de champ",
      anime: "style anime, couleurs vives, contours nets, cel shading, personnages très détaillés",
      fantasy: "art fantasy, arrière-plan épique, aura magique, éclairage dramatique, créatures mythiques",
      cyberpunk: "cyberpunk, lumières néon, ville futuriste, atmosphère sombre, détails high-tech",
      cartoon: "style cartoon, contours marqués, couleurs vives, look animation 2D, fun et ludique",
      "digital art": "peinture digitale, coups de pinceau doux, couleurs vives, haute précision",
      "oil painting": "style peinture à l'huile, texture coups de pinceau, art classique, tons chauds",
      photography: "photographie professionnelle, lumière naturelle, netteté, réaliste",
      "low poly": "style low poly, formes géométriques, minimaliste, couleurs vives",
      "pixel art": "pixel art, rétro-gaming, couleurs 8-bit, contours nets",
      surrealism: "art surréaliste, scènes oniriques, abstrait, imagination vive",
      vaporwave: "style vaporwave, couleurs pastel, rétro-futuriste, glitch art",
      "concept art": "concept art, environnement détaillé, éclairage d'ambiance, cinématique",
      portrait: "photographie portrait, gros plan, haute précision, éclairage studio",
      macro: "photographie macro, très gros plan, textures détaillées, faible profondeur de champ"
    };

    let finalPrompt;
    if (style) {
      if (styleMap[style]) {
        finalPrompt = `${rawPrompt}, ${styleMap[style]}`;
      } else {
        finalPrompt = rawPrompt;
        message.reply(getLang("invalidStyle"));
      }
    } else {
      finalPrompt = rawPrompt;
    }

    message.reply(getLang("generating"));

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/flux?prompt=${encodeURIComponent(finalPrompt)}`);
      const imageUrl = res?.data?.data?.imageUrl;

      if (!imageUrl) return message.reply(getLang("failed"));

      const imgStream = await axios.get(imageUrl, { responseType: "stream" });
      const filePath = `${__dirname}/cache/flux_${Date.now()}.jpg`;
      const writer = fs.createWriteStream(filePath);

      imgStream.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: `🧠 Prompt: ${rawPrompt}${style ? `\n🎨 Style: ${style}` : ""}`,
          attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => {
        message.reply(getLang("failed"));
      });

    } catch (err) {
      console.error(err.message);
      return message.reply(getLang("failed"));
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
