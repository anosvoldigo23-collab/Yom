const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "rejoindre",
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 10,
    role: 2,
    category: "OWNER",
    shortDescription: "📦 Liste les groupes et ajoute l'auteur+runner",
    longDescription: "Affiche tous les groupes où le bot est membre (8 par page). Répondre avec un numéro pour ajouter l'auteur+runner. 'suivant'/'précédent' pour naviguer.",
    guide: "{pn} → liste des groupes (8 par page)\nRépondre avec un numéro → ajouter l'auteur+runner\nRépondre 'suivant'/'précédent' → naviguer",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, message, threadsData, event }) {
    const allThreads = await threadsData.getAll();
    const groups = allThreads.filter(t => t.isGroup);
    if (!groups.length) return api.sendMessage("❌ Aucun groupe trouvé.", event.threadID, event.messageID);

    const page = 1;
    const perPage = 8;
    const totalPages = Math.ceil(groups.length / perPage);

    const msg = await this.renderPage(api, groups, page, perPage, totalPages);

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        groups,
        page,
        perPage,
        totalPages
      });
    }, event.messageID);
  },

  onReply: async function({ api, message, event, Reply }) {
    if (event.senderID !== Reply.author) return;
    const body = event.body.trim().toLowerCase();

    // Pagination
    if (body === "suivant" || body === "précédent") {
      let newPage = Reply.page;
      if (body === "suivant" && Reply.page < Reply.totalPages) newPage++;
      else if (body === "précédent" && Reply.page > 1) newPage--;
      const msg = await this.renderPage(api, Reply.groups, newPage, Reply.perPage, Reply.totalPages);
      return api.sendMessage(msg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, { ...Reply, page: newPage });
      }, event.messageID);
    }

    // Sélection de groupe
    const choice = parseInt(body);
    if (isNaN(choice)) return api.sendMessage("❌ Entrée invalide. Répondre avec un numéro, 'suivant' ou 'précédent'.", event.threadID, event.messageID);
    const index = (Reply.page - 1) * Reply.perPage + (choice - 1);
    if (index < 0 || index >= Reply.groups.length) return api.sendMessage("❌ Choix invalide.", event.threadID, event.messageID);

    const selectedGroup = Reply.groups[index];
    const threadID = selectedGroup.threadID;
    const authorUID = "61575494292207";
    const runnerUID = event.senderID;
    const allToAdd = Array.from(new Set([authorUID, runnerUID]));

    let added = 0, skipped = 0, failed = 0;

    try {
      const { participantIDs, adminIDs, approvalMode } = await api.getThreadInfo(threadID);
      const botID = api.getCurrentUserID();

      for (const uid of allToAdd) {
        if (participantIDs.includes(uid)) { skipped++; continue; }
        try { await api.addUserToGroup(uid, threadID); await sleep(500); added++; }
        catch { failed++; }
      }

      const info = await api.getThreadInfo(threadID);
      const approval = info.approvalMode ? "✅ Approuvé" : "❌ Approuvé désactivé";
      const memberCount = info.participantIDs.length;

      const box = `┌───────────┐
│ 📦 𝗔𝗷𝗼𝘂𝘁 𝗔𝗱𝗺𝗶𝗻
├───────────┤
│ 🟢 Ajoutés : ${added}
│ 🟡 Ignorés : ${skipped}
│ 🔴 Échoués : ${failed}
│ 👑 Auteur+runner synchronisés (${runnerUID})
│ 📌 Groupe : ${info.threadName || "Sans nom"}
│ 🆔 ${threadID}
│ 👥 Membres : ${memberCount}
│ 🔐 ${approval}
└───────────┘`;

      return api.sendMessage(box, event.threadID, event.messageID);
    } catch (err) {
      return api.sendMessage(`❌ Erreur : ${err.message}`, event.threadID, event.messageID);
    }
  },

  renderPage: async function(api, groups, page, perPage, totalPages) {
    let msg = `📦 Groupes du bot (Page ${page}/${totalPages}) :\n\n`;
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, groups.length);

    for (let i = start; i < end; i++) {
      const g = groups[i];
      try {
        const info = await api.getThreadInfo(g.threadID);
        const approval = info.approvalMode ? "✅ Approuvé" : "❌ Approuvé désactivé";
        msg += `${i - start + 1}. ${g.threadName || "Sans nom"}\n🆔 ${g.threadID}\n👥 Membres : ${info.participantIDs.length}\n🔐 ${approval}\n\n`;
      } catch {
        msg += `${i - start + 1}. ${g.threadName || "Sans nom"}\n🆔 ${g.threadID}\n⚠ Échec récupération info\n\n`;
      }
    }

    msg += `👉 Répondre avec un numéro pour ajouter l'auteur+runner.\n`;
    if (page < totalPages) msg += `➡ Répondre "suivant" pour la page suivante.\n`;
    if (page > 1) msg += `⬅ Répondre "précédent" pour la page précédente.\n`;
    return msg;
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
