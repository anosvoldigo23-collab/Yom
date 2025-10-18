const axios = require("axios");
const fs = require("fs");
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
    name: "pikachu",
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: toFancy("⚡ Génère une image de Pikachu avec du texte personnalisé"),
    longDescription: toFancy("Crée une image mignonne de Pikachu avec le texte que vous fournissez"),
    guide: toFancy("{pn} <texte>\nExemple: {pn} bonjour"),
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    en: {
      missing: "❌ Veuillez fournir du texte à mettre sur l'image de Pikachu.",
      error: "❌ Échec de la génération de l'image de Pikachu."
    }
  },

  onStart: async function({ message, args, getLang }) {
    if (!args.length) return message.reply(toFancy(getLang("missing")));

    const text = encodeURIComponent(args.join(" "));

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/pikachu?text=${text}`, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", `pikachu_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      const msg = `
╔════════════════
║ ⚡ 𝐏𝐢𝐤𝐚𝐜𝐡𝐮 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝
╠════════════════
║ 𝐓𝐞𝐱𝐭 : ${toFancy(args.join(" "))}
╚════════════════
      `;

      message.reply({
        body: msg,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      message.reply(toFancy(getLang("error")));
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
