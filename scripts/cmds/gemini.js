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

// Mémoire globale des utilisateurs
if (!global.geminiMemory) global.geminiMemory = {};

async function getGeminiResponse(userID, question) {
  // Initialise l'historique de l'utilisateur
  if (!global.geminiMemory[userID]) global.geminiMemory[userID] = [];

  // Prépare le contexte pour l'API
  const historyText = global.geminiMemory[userID]
    .map(h => `Q: ${h.question}\nA: ${h.answer}`)
    .join("\n");

  const prompt = historyText 
    ? `${historyText}\nQ: ${question}\nA:` 
    : `Q: ${question}\nA:`;

  const response = await axios.get(`${apiURL}?prompt=${encodeURIComponent(prompt)}`);
  let answer = response.data?.response || "Désolé, je n'ai pas de réponse.";

  // Stocke la nouvelle interaction
  global.geminiMemory[userID].push({ question, answer });

  // Limite l'historique pour ne pas trop charger l'API
  if (global.geminiMemory[userID].length > 10) {
    global.geminiMemory[userID].shift();
  }

  return answer;
}

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat"],
    version: "0.0.4",
    author: "Christus",
    countDown: 3,
    role: 0,
    shortDescription: "Pose une question à Gemini AI",
    longDescription: "Discute avec Gemini via l'API mise à jour par Christus avec mémoire des conversations",
    category: "AI",
    guide: "/gemini [ta question]"
  },

  onStart: async function({ api, event, args }) {
    const question = args.join(" ");
    if (!question) return api.sendMessage("⚠ Veuillez poser une question.", event.threadID, event.messageID);

    // Réponse spéciale sur le créateur
    if (question.toLowerCase().includes("créateur") || question.toLowerCase().includes("qui t'a créé")) {
      const creatorAnswer = convertirEnMathChars("Je suis une IA développée par Christus.");
      return api.sendMessage(`🤖 ${creatorAnswer}`, event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let answer = await getGeminiResponse(event.senderID, question);
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

    // Réponse spéciale sur le créateur
    if (question.toLowerCase().includes("créateur") || question.toLowerCase().includes("qui t'a créé")) {
      const creatorAnswer = convertirEnMathChars("Je suis une IA développée par Christus.");
      return api.sendMessage(`🤖 ${creatorAnswer}`, event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let answer = await getGeminiResponse(event.senderID, question);
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
