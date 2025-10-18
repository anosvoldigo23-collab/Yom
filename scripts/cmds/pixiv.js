const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Fonction pour transformer le texte en police "𝐶"
function toFancy(text) {
  const map = {
    "A":"𝐴","B":"𝐵","C":"𝐶","D":"𝐷","E":"𝐸","F":"𝐹","G":"𝐺","H":"𝐻","I":"𝐼","J":"𝐽","K":"𝐾","L":"𝐿","M":"𝑀",
    "N":"𝑁","O":"𝑂","P":"𝑃","Q":"𝑄","R":"𝑅","S":"𝑆","T":"𝑇","U":"𝑈","V":"𝑉","W":"𝑊","X":"𝑋","Y":"𝑌","Z":"𝑍",
    "a":"𝑎","b":"𝑏","c":"𝑐","d":"𝑑","e":"𝑒","f":"𝑓","g":"𝑔","h":"ℎ","i":"𝑖","j":"𝑗","k":"𝑘","l":"𝑙","m":"𝑚",
    "n":"𝑛","o":"𝑜","p":"𝑝","q":"𝑞","r":"𝑟","s":"𝑠","t":"𝑡","u":"𝑢","v":"𝑣","w":"𝑤","x":"𝑥","y":"𝑦","z":"𝑧"
  };
  return text.split("").map(c => map[c] || c).join("");
}

module.exports = {
  config: {
    name: "pixiv",
    version: "1.1",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    category: "nsfw",
    shortDescription: toFancy("🎨 Pixiv NSFW Random Image"),
    longDescription: toFancy("Récupère une image NSFW Pixiv aléatoire selon le mot-clé fourni"),
    guide: toFancy("{pn} <mot-clé>\nEx : pixiv loli"),
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, message, args }) {
    if (!args || args.length === 0) 
      return message.reply(toFancy("❌ Veuillez fournir un mot-clé.\nEx : pixiv loli"));

    const query = args.join("+");
    const apiUrl = `https://archive.lick.eu.org/api/nsfw/pixiv?query=${query}`;

    try {
      message.reply(toFancy("🎨 Récupération de l'image Pixiv..."));

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `pixiv_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);

      const msg = `
╔═══════════════════
║ 🎨 𝐏𝐢𝐱𝐢𝐯 𝐑𝐞𝐬𝐮𝐥𝐭
╠═══════════════════
║ 𝐌𝐨𝐭-𝐜𝐥é : "${toFancy(args.join(" "))}"
╚═══════════════════
      `;

      api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply(toFancy("❌ Une erreur est survenue lors de la récupération de l'image."));
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
