const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "neko",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: { en: "🐱 Envoie une image de neko adorable" },
    longDescription: { en: "Récupère une image de neko girl mignonne depuis l'API waifu.pics et l'envoie avec style !" },
    guide: { en: "+neko" },
    usePrefix: false, // Désactive le préfixe
    noPrefix: true    // Activation noprefix
  },

  onStart: async function ({ message }) {
    const apiUrl = "https://api.waifu.pics/sfw/neko";
    const filePath = path.join(__dirname, "cache", `neko_${Date.now()}.jpg`);

    try {
      message.reply("✨ 𝗥𝗲𝗰𝗵𝗲𝗿𝗰𝗵𝗲 𝗱'𝘂𝗻𝗲 𝗻𝗲𝗸𝗼 𝗺𝗶𝗴𝗻𝗼𝗻𝗻𝗲... 🐾");

      https.get(apiUrl, res => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          const image = JSON.parse(data).url;
          const file = fs.createWriteStream(filePath);
          https.get(image, imgRes => {
            imgRes.pipe(file);
            file.on("finish", () => {
              // Message stylé avec encadré "manga"
              const caption = `
╔═══════════════════
║ 🐱 𝐍𝐞𝐤𝐨 𝐓𝐢𝐦𝐞 🐾
╠═══════════════════
║ 🌸 𝗔𝗹𝗲𝗿𝘁𝗲 𝗳𝗶𝗹𝗹𝗲 𝗻𝗲𝗸𝗼 !
║ 🎀 Profitez de cette image kawaii
╚═══════════════════
              `.trim();

              message.reply({
                body: caption,
                attachment: fs.createReadStream(filePath)
              }, () => fs.unlinkSync(filePath)); // Supprime le fichier après envoi
            });
          });
        });
      });
    } catch (err) {
      console.error("❌ Erreur Neko:", err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image Neko.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
