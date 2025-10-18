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
    name: "pitié",
    version: "1.1",
    author: "Christus x Aesther",
    countDown: 10,
    role: 0,
    category: "image",
    shortDescription: toFancy("🐾 Ajoute un effet de patte de chat à une photo de profil"),
    longDescription: toFancy("Génère une image mignonne avec l'effet de patte de chat sur la photo de profil de l'utilisateur mentionné ou de vous-même"),
    guide: toFancy("{pn} [@mention ou réponse]\nSi aucune mention ou réponse, utilise votre propre photo de profil"),
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ api, event, message }) {
    const { senderID, mentions, type, messageReply } = event;

    let uid;
    if (Object.keys(mentions).length > 0) uid = Object.keys(mentions)[0];
    else if (type === "message_reply") uid = messageReply.senderID;
    else uid = senderID;

    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      const res = await axios.get(`https://api.popcat.xyz/v2/pet?image=${encodeURIComponent(avatarURL)}`, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, "cache", `pet_${uid}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      const msg = `
╔════════════════════════
║ 🐾 𝐏𝐚𝐭𝐭𝐞 𝐝𝐞 𝐂𝐡𝐚𝐭 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝
╠════════════════════════
║ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐞𝐮𝐫 : ${toFancy(uid)}
╚════════════════════════
      `;

      message.reply({
        body: msg,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      message.reply(toFancy("❌ Échec de la génération de l'image avec l'effet de patte."));
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
