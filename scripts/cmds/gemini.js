const g = require("fca-aryan-nix");
const axios = require("axios");
const apiURL = "http://65.109.80.126:20409/aryan/gemini";

// Fonction pour convertir le texte en caractères mathématiques gras/script
function convertirEnMathChars(text) {
  const mapping = {
    "A":"𝐴","B":"𝐵","C":"𝐶","D":"𝐷","E":"𝐸","F":"𝐹","G":"𝐺","H":"𝐻","I":"𝐼","J":"𝐽","K":"𝐾","L":"𝐿","M":"𝑀","N":"𝑁","O":"𝑂","P":"𝑃","Q":"𝑄","R":"𝑅","S":"𝑆","T":"𝑇","U":"𝑈","V":"𝑉","W":"𝑊","X":"𝑋","Y":"𝑌","Z":"𝑍",
    "a":"𝑎","b":"𝑏","c":"𝑐","d":"𝑑","e":"𝑒","f":"𝑓","g":"𝑔","h":"ℎ","i":"𝑖","j":"𝑗","k":"𝑘","l":"𝑙","m":"𝑚","n":"𝑛","o":"𝑜","p":"𝑝","q":"𝑞","r":"𝑟","s":"𝑠","t":"𝑡","u":"𝑢","v":"𝑣","w":"𝑤","x":"𝑥","y":"𝑦","z":"𝑧"
  };
  return text.split("").map(c => mapping[c] || c).join("");
}

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat"],
    version: "0.0.2",
    author: "Christus",
    countDown: 3,
    role: 0,
    shortDescription: "Pose une question à Gemini AI",
    longDescription: "Discute avec Gemini via l'API mise à jour par Christus",
    category: "AI",
    guide: "/gemini [ta question]"
  },

  onStart: async function({ api, event, args }) {
    const question = args.join(" ");
    if (!question) return api.sendMessage("⚠ Veuillez poser une question.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`${apiURL}?prompt=${encodeURIComponent(question)}`);
      let answer = response.data?.response;
      if (!answer) throw new Error("Aucune réponse reçue de l'API Gemini.");

      // Conversion en caractères mathématiques
      answer = convertirEnMathChars(answer);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const replyText = 
`╔══════════════════════╗
║        QUESTION       ║
╚══════════════════════╝
💬 ${question}

╔══════════════════════╗
║        RÉPONSE        ║
╚══════════════════════╝
🤖 ${answer}`;

      api.sendMessage(replyText, event.threadID, (err, info) => {
        if (!info) return;
        global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ Erreur lors de la récupération de la réponse de Gemini.", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const question = event.body;
    if (!question) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`${apiURL}?prompt=${encodeURIComponent(question)}`);
      let answer = response.data?.response;
      if (!answer) throw new Error("Aucune réponse reçue de l'API Gemini.");

      answer = convertirEnMathChars(answer);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const replyText = 
`╔══════════════════════╗
║        QUESTION       ║
╚══════════════════════╝
💬 ${question}

╔══════════════════════╗
║        RÉPONSE        ║
╚══════════════════════╝
🤖 ${answer}`;

      api.sendMessage(replyText, event.threadID, (err, info) => {
        if (!info) return;
        global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ Erreur lors de la récupération de la réponse de Gemini.", event.threadID, event.messageID);
    }
  }
};

const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
