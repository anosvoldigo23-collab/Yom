const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "steal",
    aliases: [],
    version: "3.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2, // réservé au propriétaire/admin
    category: "outils",
    shortDescription: "👥 Copie les membres d’un groupe vers un autre",
    longDescription: "Copie les membres d’un groupe source vers le groupe courant en utilisant les IDs de discussion.",
    guide: "{pn} [threadID] → Copier les membres d’un autre groupe\n📌 Le bot doit être présent dans les deux groupes.",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args, event }) {
    const { threadID, messageID } = event;
    const currentThreadID = threadID;
    const targetThreadID = args[0];

    if (!targetThreadID || isNaN(targetThreadID)) {
      return message.reply(
        "❌ Veuillez fournir un ID de groupe valide !\n\nUtilisation : stea [threadID]"
      );
    }

    try {
      const threadInfo = await message.api.getThreadInfo(targetThreadID);
      const members = threadInfo.participantIDs.filter(id => id !== message.api.getCurrentUserID());

      if (!members || members.length === 0) {
        return message.reply("⚠️ Aucun membre trouvé dans le groupe cible.");
      }

      let added = 0;
      let failed = 0;

      message.reply(
        `⏳ Début du processus de copie des membres...\nGroupe cible : ${targetThreadID}\nNombre total de membres : ${members.length}`
      );

      for (const userID of members) {
        try {
          await message.api.addUserToGroup(userID, currentThreadID);
          added++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Pause pour éviter les blocages
        } catch (err) {
          failed++;
        }
      }

      const msg =
        `🎯 Processus terminé !\n\n` +
        `👥 Membres scannés : ${members.length}\n✅ Ajoutés : ${added}\n❌ Échecs : ${failed}\n\n` +
        `💡 Astuce : Certains utilisateurs peuvent avoir des paramètres qui empêchent leur ajout ou sont déjà dans le groupe.`;

      return message.reply(msg);
    } catch (error) {
      console.error("Erreur de vol :", error.message);
      return message.reply(
        "❌ Échec de la récupération des informations du groupe cible. Vérifiez que l'ID est correct et que le bot est bien présent dans ce groupe."
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
