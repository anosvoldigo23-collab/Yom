const axios = require("axios");
const fs = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "flux3",
    aliases: ["fluxv3"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 10,
    role: 0,
    shortDescription: "Génère une image IA en utilisant l'API FluxAWS",
    longDescription: "Utilisez l'invite et le ratio pour générer des images IA impressionnantes en utilisant fluxaws",
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <invite> | <ratio>\nExemple: {pn} a cat with glasses | 1.2"
    },
    noPrefix: true
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").split("|");
    const query = input[0]?.trim();
    const ration = input[1]?.trim() || 1;

    if (!query) {
      return api.sendMessage(
        "❌ | Veuillez fournir une invite pour générer l'image.\nExemple:\nflux Un dragon sur Mars | 1.5",
        event.threadID,
        event.messageID
      );
    }

    const waiting = await api.sendMessage("⚙️ | Génération de l'image, veuillez patienter...", event.threadID);

    try {
      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/fluxaws",
        responseType: "arraybuffer",
        params: { query, ration }
      });

      const filePath = __dirname + `/cache/flux_${event.senderID}.png`;
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `🧠 Invite: ${query}\n📐 Ratio: ${ration}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), waiting.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ | Échec de la génération de l'image. Veuillez réessayer plus tard.",
        event.threadID,
        waiting.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
