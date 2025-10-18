const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "spin",
    version: "4.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "jeu",
    shortDescription: "🎰 Tourne la roue et tente ta chance !",
    longDescription: "Tourne la roue pour gagner ou perdre de l'argent avec des multiplicateurs allant jusqu'à 10× ! Consulte le classement des meilleurs gains avec 'spin top'.",
    guide: "{pn} <montant> → joue\n{pn} top → voir le classement",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, event, args, usersData }) {
    const utilisateurID = event.senderID;
    const sousCommande = args[0];

    // 🏆 Top des meilleurs
    if (sousCommande?.toLowerCase() === "top") {
      const tousUtilisateurs = await usersData.getAll();

      const top = tousUtilisateurs
        .filter(u => typeof u.data?.totalSpinWin === "number" && u.data.totalSpinWin > 0)
        .sort((a, b) => b.data.totalSpinWin - a.data.totalSpinWin)
        .slice(0, 10);

      if (!top.length) return message.reply("❌ Aucun gagnant pour le moment.");

      const resultat = top.map((user, i) => {
        const nom = user.name || `Utilisateur ${user.userID?.slice(-4) || "??"}`;
        return `\`${i + 1}.\` ${nom} – 💸 ${user.data.totalSpinWin}$`;
      }).join("\n");

      return message.reply(
        `🏆 𝗧𝗼𝗽 𝗱𝗲𝘀 𝗴𝗮𝗴𝗻𝗮𝗻𝘁𝘀 🎰 :\n\n${resultat}`
      );
    }

    // 🎲 Jouer avec un montant
    const mise = parseInt(sousCommande);
    if (isNaN(mise) || mise <= 0) {
      return message.reply("❌ Utilisation correcte :\nspin <montant>\nspin top");
    }

    const userData = await usersData.get(utilisateurID) || {};
    userData.money = userData.money || 0;
    userData.data = userData.data || {};
    userData.data.totalSpinWin = userData.data.totalSpinWin || 0;

    if (userData.money < mise) {
      return message.reply(`❌ Solde insuffisant.\n💰 Ton solde actuel : ${userData.money}$`);
    }

    // 💸 Déduction de la mise
    userData.money -= mise;

    // ⚡ Issues améliorées avec effets visuels
    const issues = [
      { texte: "💥 Tout perdu ! Quelle malchance...", multiplicateur: 0 },
      { texte: "😞 Tu récupères seulement la moitié...", multiplicateur: 0.5 },
      { texte: "🟡 Égalité ! Ni perte ni gain.", multiplicateur: 1 },
      { texte: "🟢 Doublé ! Bien joué !", multiplicateur: 2 },
      { texte: "🔥 Triple mise ! Le destin te sourit !", multiplicateur: 3 },
      { texte: "🎉 JACKPOT ! 10× ta mise !!! Incroyable !", multiplicateur: 10 }
    ];

    const resultat = issues[Math.floor(Math.random() * issues.length)];
    const gain = Math.floor(mise * resultat.multiplicateur);
    userData.money += gain;

    if (gain > mise) {
      const profit = gain - mise;
      userData.data.totalSpinWin += profit;
    }

    await usersData.set(utilisateurID, userData);

    // ✨ Message final avec cadre stylé
    const spinMsg = `
┌─🎰 𝗥𝗼𝘂𝗲 𝗱𝗲 𝗹𝗮 𝗰𝗵𝗮𝗻𝗰𝗲 ─────────┐
│ 🔹 Mise : ${mise}$
│ 🔹 Gain : ${gain}$
│ 🔹 Nouveau solde : ${userData.money}$
│
│ ${resultat.texte}
└───────────────────────────────┘
💡 Astuce : Plus tu joues, plus tu peux grimper dans le top !
    `.trim();

    return message.reply(spinMsg);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
