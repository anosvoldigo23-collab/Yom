const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "hack",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    category: "fun",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: {
      en: "Génère une image de 'piratage' avec la photo de profil de l'utilisateur."
    }
  },

  wrapText: async (ctx, name, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(name).width < maxWidth) return resolve([name]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = name.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event }) {
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/Avtmot.png";

    const mentionKeys = event.mentions ? Object.keys(event.mentions) : [];
    const id = mentionKeys[0] || event.senderID;

    try {
      const userInfo = await api.getUserInfo(id);
      const name = userInfo && userInfo[id] ? userInfo[id].name : "Utilisateur";

      const backgrounds = [
        "https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ"
      ];
      const rd = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Récupérer avatar (arraybuffer)
      const getAvtmot = (await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

      // Récupérer background (arraybuffer)
      const getbackground = (await axios.get(rd, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

      // Création du canvas
      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 200, 497);

      ctx.beginPath();
      ctx.drawImage(baseAvt1, 83, 437, 100, 101);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(pathAvt1);

      return api.sendMessage(
        {
          body: "✅ Utilisateur piraté avec succès! Veuillez consulter l'image.",
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (err) {
      console.error("❌ Erreur dans la commande hack:", err);
      return api.sendMessage("❌ Une erreur est survenue lors de la génération de l'image.", event.threadID, event.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
