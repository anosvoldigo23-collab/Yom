const axios = require("axios");
const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "logo",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "image",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "🎨 Crée un logo personnalisé avec style",
    longDescription: "Génère un logo avec un titre, un slogan et une idée grâce à une API AI",
    guide: "{pn} <titre> | <slogan> | <idée>\nEx : {pn} Naruto | Yes | OO"
  },

  onStart: async function({ args, message, event }) {
    const { threadID, messageID } = event;

    if (!args[0]) return message.reply(`❌ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 :\n${this.config.guide}`);

    // Parse arguments : titre | slogan | idée
    const input = args.join(" ").split("|").map(e => e.trim());
    const title = input[0] || "Titre";
    const slogan = input[1] || "Slogan";
    const idea = input[2] || "Idée";

    const apiUrl = `https://archive.lick.eu.org/api/ai/logo-gen?title=${encodeURIComponent(title)}&slogan=${encodeURIComponent(slogan)}&idea=${encodeURIComponent(idea)}`;
    const tempPath = path.join(__dirname, `logo_${Date.now()}.png`);

    try {
      const waitMsg = await message.reply("🎨✨ 𝐆𝐞́𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐮 𝐥𝐨𝐠𝐨 𝐞𝐧 𝐜𝐨𝐮𝐫𝐬... Patiente un instant ✨🎨");

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempPath, response.data);

      const caption = `
╔═════════════════════════
║ 🌟🎨 𝗟𝗢𝗚𝗢 𝗠𝗔𝗞𝗘𝗥 🎨🌟
╠═════════════════════════
║ 📌 𝐓𝐢𝐭𝐫𝐞 : ${title}
║ 💬 𝐒𝐥𝐨𝐠𝐚𝐧 : ${slogan}
║ 💡 𝐈𝐝𝐞́𝐞 : ${idea}
╠═════════════════════════
║ 🔥 𝐋𝐨𝐠𝐨 𝐠𝐞́𝐧𝐞́𝐫𝐞́ 𝐚𝐯𝐞𝐜 𝐬𝐮𝐜𝐜𝐞̀𝐬 ! 🔥
╚═════════════════════════
      `.trim();

      await message.reply({
        body: caption,
        attachment: fs.createReadStream(tempPath)
      });

      await message.unsend(waitMsg.messageID);
      fs.unlinkSync(tempPath);

    } catch (err) {
      console.error("❌ Erreur logo maker :", err);
      return message.reply("❌ 𝐔𝐧𝐞 𝐞𝐫𝐫𝐞𝐮𝐫 𝐬'𝐞𝐬𝐭 𝐬𝐮𝐫𝐯𝐞𝐧𝐮𝐞 𝐥𝐨𝐫𝐬 𝐝𝐞 𝐥𝐚 𝐠𝐞́𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐮 𝐥𝐨𝐠𝐨.", threadID, messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
