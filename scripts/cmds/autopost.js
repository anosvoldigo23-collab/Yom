const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports.config = {
  name: "autopost",
  version: "2.1.0",
  description: "Autopost tracker de jardin avec scores multiples, noms, outils, graines, œufs, cosmétiques, miel, météo, gains de points et activation/désactivation",
  usage: "autopost on/off/score",
  role: 0,
  author: "Christus x Aesther",
  noPrefix: true // Activation noprefix
};

let autoPostInterval = null;
let activeUsers = new Set();
let userScores = {};
let userNames = {};

module.exports.onStart = async function({ api, event, usersData }) {
  const args = event.body.trim().split(' ');
  const action = args[0]?.toLowerCase();
  const replyToId = event.messageID;
  const userId = event.senderID;

  if (action === 'on') {
    if (activeUsers.has(userId)) return api.sendMessage("Vous êtes déjà dans l'autopost !", event.threadID, replyToId);

    if (!userNames[userId]) {
      try {
        const userInfo = await api.getUserInfo(userId);
        userNames[userId] = userInfo[userId].name;
      } catch {
        userNames[userId] = 'Inconnu';
      }
    }

    activeUsers.add(userId);
    if (!userScores[userId]) userScores[userId] = 0;

    if (!autoPostInterval) {
      autoPostInterval = setInterval(async () => {
        // Données statiques
        const gear = [
          '- Billet d\'échange : x1',
          '- 🧴 Spray de nettoyage : x1',
          '- 🛠 Truelle : x3',
          '- 🔧 Clé de rappel : x3',
          '- 🚿 Arrosoir : x3',
          '- ❤ Outil préféré : x2',
          '- 💧 Arroseur de base : x3',
          '- 🌾 Outil de récolte : x1',
          '- 🎫 Billet 2 : x1'
        ];

        const baseSeeds = [
          '- 🥕 Carotte : x14',
          '- 🍇 Raisin : x1',
          '- 🍓 Fraise : x5',
          '- 🌷 Tulipe orange : x24',
          '- 🍅 Tomate : x3',
          '- 🫐 Myrtille : x5',
          '- 🍎 Pomme : x10',
          '- 🍌 Banane : x20',
          '- 🌽 Maïs : x8',
          '- 🍎 Pomme rouge : x15'
        ];

        const shuffledSeeds = baseSeeds.sort(() => 0.5 - Math.random());
        const selectedSeeds = shuffledSeeds.slice(0, 6);

        const eggs = ['- 🥚 Œuf commun : x1','- 🥚 Œuf commun : x1','- 🥚 Œuf commun : x1'];

        const cosmetics = [
          '- Caisse de plage : x2','- Cabana : x1','- Bac à compost : x1','- Torche : x1',
          '- Table en pierre longue : x1','- Tas de pierres : x1','- Petite tuile circulaire : x5',
          '- Grande table en bois : x1','- Bibliothèque : x1'
        ];

        const honey = [
          '- Radar corrompu : x1','- Pack de graines Zen : x1','- Buisson Sakura : x1','- Zenflare : x2',
          '- Radar Tranquille : x2','- Rayon de miel : x5','- Ruche : x3','- Gelée royale : x2'
        ];

        const weather = '⚡ Orage\n📋 Orage - Fin : 14:42 - Durée : 3 minutes\n+50% vitesse de croissance ! Plus de chances de fruits électrisés !\n🎯 +50% croissance ; même chance de pluie';

        const fullMessage = `𝗝𝗮𝗿𝗱𝗶𝗻 — 𝗧𝗿𝗮𝗰𝗸𝗲𝗿\n\n🛠 𝗢𝘂𝘁𝗶𝗹𝘀 :\n${gear.join('\n')}\n⏳ Reapprovisionnement : 00h 04m 55s\n\n🌱 𝗚𝗿𝗮𝗶𝗻𝗲𝘀 :\n${selectedSeeds.join('\n')}\n⏳ Reapprovisionnement : 00h 04m 55s\n\n🥚 𝗢𝗲𝘂𝗳𝘀 :\n${eggs.join('\n')}\n⏳ Reapprovisionnement : 00h 19m 55s\n\n🎨 𝗖𝗼𝘀𝗺𝗲́𝘁𝗶𝗾𝘂𝗲𝘀 :\n${cosmetics.join('\n')}\n⏳ Reapprovisionnement : 06h 19m 55s\n\n🍯 𝗠𝗶𝗲𝗹 :\n${honey.join('\n')}\n⏳ Reapprovisionnement : 00h 19m 55s\n\n🌤 𝗠𝗲́𝘁𝗲́𝗼 :\n${weather}\n\n🏅 𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗲𝘂𝗿𝘀 𝗮𝗰𝘁𝗶𝗳𝘀 :\n${Array.from(activeUsers).map(id => `👤 ${userNames[id]||'Inconnu'} : 🏆 ${userScores[id]||0}`).join('\n')}\n\n📅 Mis à jour : ${new Date().toLocaleString('fr-FR')}\n\n🌟 Super suivi de jardin ! 🌟`;

        try {
          api.createPost(fullMessage);
          for (const id of activeUsers) {
            userScores[id] = (userScores[id]||0)+86000;
            const userData = await usersData.get(id)||{ money:0 };
            await usersData.set(id,{ ...userData, money:(userData.money||0)+86000 });
          }
        } catch {}
      }, 120000);
    }

    api.sendMessage("Autopost activé ! Publication toutes les 2 minutes.", event.threadID, replyToId);

  } else if (action === 'off') {
    if (activeUsers.has(userId)) {
      activeUsers.delete(userId);
      if (!activeUsers.size) clearInterval(autoPostInterval);
      api.sendMessage("Autopost désactivé pour vous !", event.threadID, replyToId);
    } else {
      api.sendMessage("Vous n'êtes pas dans l'autopost !", event.threadID, replyToId);
    }

  } else if (action === 'score') {
    api.sendMessage(`Votre score : ${userScores[userId]||0}`, event.threadID, replyToId);

  } else {
    api.sendMessage("Utilisation : autopost on/off/score", event.threadID, replyToId);
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
