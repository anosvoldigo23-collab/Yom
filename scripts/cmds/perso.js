const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Définition des personnages
const characters = {
  zoro: { name: "Zoro", emoji: "🗡️", api: "https://arychauhann.onrender.com/api/zoro" },
  tanjiro: { name: "Tanjiro", emoji: "🌸", api: "https://arychauhann.onrender.com/api/tanjiro" },
  gojo: { name: "Gojo", emoji: "🕶️", api: "https://arychauhann.onrender.com/api/gojo" },
  nezuko: { name: "Nezuko", emoji: "🎀", api: "https://arychauhann.onrender.com/api/nezuko" }
};

// Fonction pour convertir le texte en police "𝐶"
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
    name: "perso",
    aliases: ["char", "personnage", "animebot"],
    version: "1.2",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "IA",
    shortDescription: "💬 Parle avec ton personnage préféré",
    longDescription: "Discuter avec Zoro, Tanjiro, Gojo ou Nezuko via leurs APIs respectives.",
    guide: "{pn} <personnage> <texte>",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, args }) {
    const perso = args[0]?.toLowerCase();
    const prompt = args.slice(1).join(" ");

    if (!perso || !characters[perso])
      return api.sendMessage(
        toFancy(`❌ Personnage invalide ! Choisis parmi : ${Object.keys(characters).join(", ")}`),
        event.threadID,
        event.messageID
      );

    if (!prompt)
      return api.sendMessage(
        toFancy("❌ Veuillez entrer un texte à envoyer au personnage."),
        event.threadID,
        event.messageID
      );

    try {
      const url = `${characters[perso].api}?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      if (res.data && res.data.result) {
        const reply = res.data.result;

        const message = `
╔═══════════════
║ ${characters[perso].emoji} ${toFancy(characters[perso].name)}
╠═══════════════
║ 💬 Question :
║ ${toFancy(prompt)}
╠═══════════════
║ 📝 Réponse :
║ ${toFancy(reply)}
╚═══════════════
        `;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage(
          toFancy(`⚠️ Impossible d'obtenir une réponse de ${characters[perso].name}.`),
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      api.sendMessage(
        toFancy(`❌ Une erreur est survenue lors de la connexion à l'API ${characters[perso].name}.`),
        event.threadID,
        event.messageID
      );
      console.error(err);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
