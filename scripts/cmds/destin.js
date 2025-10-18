const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "destin",
    aliases: ["destin", "fate"],
    version: "2.0",
    author: "Christus",
    role: 0,
    category: "fun",
    shortDescription: { fr: "🔮 Système de prédiction personnelle" },
    longDescription: { fr: "Fournit une prédiction détaillée pour l’utilisateur (mort, amour, enfants, talents, richesse, etc.)" },
    guide: { fr: "destin [nom/ID] (facultatif)" },
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Déterminer l'utilisateur cible
      let targetName, targetID;
      if (args.length > 0) {
        targetID = Object.keys(event.mentions)[0] || args[0];
        try {
          const userInfo = await api.getUserInfo(targetID);
          targetName = userInfo[targetID].name;
        } catch {
          targetName = args.join(" ");
        }
      } else {
        targetID = event.senderID;
        const userInfo = await api.getUserInfo(targetID);
        targetName = userInfo[targetID].name;
      }

      // Créer une graine depuis l’ID utilisateur
      const seed = targetID.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const random = (min, max) => Math.floor((seed % (max - min + 1)) + min);

      // Prédictions
      const predictions = {
        death: [
          `⚰️ ${targetName}, tu partiras paisiblement dans ton sommeil une nuit d'hiver…`,
          `⚰️ ${targetName}, tu mourras à 82 ans, aux côtés d’une personne très spéciale.`,
          `⚰️ ${targetName}, un accident changera ton destin de manière inattendue.`,
          `⚰️ ${targetName}, tu vivras à jamais à travers ce que tu auras créé.`,
          `⚰️ ${targetName}, tes derniers jours seront passés très proche de la nature.`
        ],
        child: [
          `👶 ${targetName}, ton prochain enfant sera une fille, et elle étonnera tout le monde par son intelligence.`,
          `👶 ${targetName}, ton enfant sera introverti mais plein de rêves.`,
          `👶 ${targetName}, ton enfant naîtra en ${["avril", "octobre", "décembre", "juillet", "février"][random(0,4)]}.`
        ],
        love: [
          `💞 ${targetName}, ta moitié sera une personne que tu n’as jamais vraiment remarquée.`,
          `💞 ${targetName}, ton amour apparaîtra de façon inattendue, peut-être ${["à une foire", "en voyage", "au travail", "à l'hôpital", "en ligne"][random(0,4)]}.`,
          `💞 ${targetName}, tu tomberas amoureux(se) d’une personne étrangère.`
        ],
        talent: [
          `🧠 ${targetName}, tu caches en toi un(e) ${["poète", "inventeur", "leader", "artiste", "chercheur"][random(0,4)]}.`,
          `🧠 ${targetName}, tu as le don des mots — un jour, tes écrits feront pleurer.`
        ],
        luck: [
          `🍀 ${targetName}, tes numéros porte-bonheur sont : ${random(1,9)}, ${random(10,20)}, ${random(21,30)}.`,
          `🍀 ${targetName}, la couleur ${["rouge", "bleu", "blanc", "vert", "violet"][random(0,4)]} t’apportera chance.`
        ],
        wealth: [
          `💰 ${targetName}, ta richesse viendra soudainement grâce à ${["un ami", "une invention", "une décision", "un voyage", "un accident"][random(0,4)]}.`,
          `💰 ${targetName}, ta fortune viendra de ${["ton travail", "ta chance", "un héritage", "un investissement", "ta créativité"][random(0,4)]}.`
        ],
        pastLife: [
          `🌌 ${targetName}, dans une vie antérieure, tu étais ${["un guerrier", "un poète", "un fermier", "un artiste", "un prêtre", "un marchand", "un guérisseur"][random(0,6)]}.`,
          `🌌 ${targetName}, certaines de tes quêtes inachevées de ton ancienne vie se réaliseront dans celle-ci.`
        ]
      };

      // Sélection aléatoire
      const deathPred = predictions.death[random(0, predictions.death.length - 1)];
      const childPred = predictions.child[random(0, predictions.child.length - 1)];
      const lovePred = predictions.love[random(0, predictions.love.length - 1)];
      const talentPred = predictions.talent[random(0, predictions.talent.length - 1)];
      const luckPred = predictions.luck[random(0, predictions.luck.length - 1)];
      const wealthPred = predictions.wealth[random(0, predictions.wealth.length - 1)];
      const pastLifePred = predictions.pastLife[random(0, predictions.pastLife.length - 1)];

      // Message final
      const finalMessage =
        `🔮 ${targetName}, voici ta prédiction personnelle...\n\n` +
        `${deathPred}\n\n${childPred}\n\n${lovePred}\n\n${talentPred}\n\n${luckPred}\n\n${wealthPred}\n\n${pastLifePred}\n\n` +
        `✨ Le destin peut toujours changer — tes actions déterminent ton véritable avenir ✨`;

      api.sendMessage(finalMessage, event.threadID);

    } catch (error) {
      console.error("Erreur de prédiction :", error);
      api.sendMessage("🔮 Une erreur est survenue lors de la prédiction, réessaie plus tard...", event.threadID);
    }
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
