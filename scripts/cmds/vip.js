const fs = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour NOPREFIX

const header = `👑 𝐕𝐎𝐋𝐃𝐘 𝗩𝗜𝗣 𝗨𝗦𝗘𝗥𝗦 👑`;
const vipFilePath = "vip.json";
const changelogFilePath = "changelog.json";

// 🔹 Fonctions utilitaires
function loadVIPData() {
  try {
    return fs.readJsonSync(vipFilePath);
  } catch (err) {
    return {};
  }
}

function saveVIPData(data) {
  try {
    fs.writeJsonSync(vipFilePath, data, { spaces: 2 });
  } catch (err) {
    console.error("Erreur en sauvegardant VIP:", err);
  }
}

function loadChangelog() {
  try {
    return fs.readJsonSync(changelogFilePath);
  } catch (err) {
    return {};
  }
}

// 💎 Commande VIP NOPREFIX
module.exports = {
  config: {
    name: "vip",
    version: "2.0",
    author: "Christus x Aesther",
    role: 2,
    category: "Configuration",
    shortDescription: "✨ Gestion des utilisateurs VIP",
    longDescription: "Ajoute, retire, liste les VIP et consulte le changelog du système.",
    guide: `add <uid> - Ajoute un utilisateur à la VIP
rm <uid> - Retire un utilisateur de la VIP
list - Affiche tous les VIP
changelog - Montre les nouveautés`,
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args, usersData, api }) {
    const subcommand = args[0];
    if (!subcommand) return;

    let vipData = loadVIPData();

    // ➕ Ajouter VIP
    if (subcommand === "add") {
      const uid = args[1];
      if (!uid) return message.reply(`${header}\n⚠️ Veuillez fournir un UID.`);

      const user = await usersData.get(uid);
      if (!user) return message.reply(`${header}\n❌ Utilisateur introuvable pour l'UID ${uid}.`);

      vipData[uid] = true;
      saveVIPData(vipData);

      message.reply(`${header}\n✅ ${user.name} (${uid}) est désormais VIP ! 🎉`);
      api.sendMessage(`${header}\n🎉 Félicitations ${user.name}, tu es VIP ! Profite des fonctionnalités exclusives !`, uid);

    // ❌ Retirer VIP
    } else if (subcommand === "rm") {
      const uid = args[1];
      if (!uid || !vipData[uid]) return message.reply(`${header}\n⚠️ UID invalide ou non VIP.`);

      const user = await usersData.get(uid);
      delete vipData[uid];
      saveVIPData(vipData);

      message.reply(`${header}\n✅ ${user.name} (${uid}) a été retiré de la liste VIP.`);
      api.sendMessage(`${header}\n❌ ${user.name}, tu n'es plus VIP.`, uid);

    // 📜 Liste des VIP
    } else if (subcommand === "list") {
      const vipList = await Promise.all(Object.keys(vipData).map(async uid => {
        const user = await usersData.get(uid);
        return `• ${user?.name || "Inconnu"} (${uid})`;
      }));

      message.reply(`${header}\n📝 Liste des VIP:\n\n${vipList.join("\n") || "Aucun VIP enregistré."}`);

    // 📝 Changelog
    } else if (subcommand === "changelog") {
      const changelog = loadChangelog();
      const entries = Object.keys(changelog).map(v => `Version ${v} : ${changelog[v]}`).join("\n");
      message.reply(`${header}\n📄 Changelog :\n${entries || "Aucun changement enregistré."}`);
    }
  }
};

// ⚡ Activation NOPREFIX
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
