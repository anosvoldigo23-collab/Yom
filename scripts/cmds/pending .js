const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "pen",
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 2,
    category: "admin",
    shortDescription: "🛡️ Gérer les demandes de groupe en attente",
    longDescription: "Approuver ou rejeter les demandes de groupe en attente dans la liste des spams ou les groupes non approuvés",
    guide: `
📌 Instructions :
- Afficher la liste des groupes en attente : 'pen'
- Approuver les groupes : 'approve <numéros>'
- Rejeter les groupes : 'cancel <numéros>'
Exemple : 'approve 1 2 3'
    `.trim(),
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    en: {
      invalidNumber: "⚠️ Entrée invalide\n─────────────────\n» %1 n'est pas un nombre valide. Veuillez entrer uniquement des nombres.",
      cancelSuccess: "❌ Demande rejetée\n─────────────────\n» Rejet avec succès de %1 groupe(s).",
      approveSuccess: "✅ Demande approuvée\n─────────────────\n» Approbation réussie de %1 groupe(s).",
      cantGetPendingList: "⚠️ Erreur\n─────────────────\n» Impossible de récupérer la liste des demandes en attente. Réessayez plus tard.",
      returnListPending: "📋 Groupes en attente (%1)\n─────────────────\n%2\n» Répondre avec :\n» 'approve <numéros>' pour approuver\n» 'cancel <numéros>' pour rejeter",
      returnListClean: "ℹ️ Aucun groupe en attente\n─────────────────\n» La liste des demandes est vide pour le moment.",
      noSelection: "⚠️ Entrée manquante\n─────────────────\n» Veuillez spécifier quels groupes traiter.\n» Exemple : 'approve 1 2 3'",
      instruction: "📝 Instructions\n─────────────────\n1. Afficher les groupes : 'pen'\n2. Approuver : 'approve <numéros>'\n3. Rejeter : 'cancel <numéros>'"
    }
  },

  onStart: async function({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;

    try {
      const [spam, pending] = await Promise.all([
        api.getThreadList(100, null, ["OTHER"]).catch(() => []),
        api.getThreadList(100, null, ["PENDING"]).catch(() => [])
      ]);

      const list = [...spam, ...pending]
        .filter(g => g.isSubscribed && g.isGroup)
        .map((g, i) => ({ ...g, displayIndex: i + 1 }));

      if (!list.length) {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }

      const msg = list.map(g =>
        `╭───────────────\n` +
        `│ ${g.displayIndex}. ${g.name || "Groupe sans nom"}\n` +
        `│ 👥 Membres : ${g.participantIDs.length}\n` +
        `│ 🆔 ID : ${g.threadID}\n` +
        `╰───────────────`
      ).join("\n\n");

      const replyMsg = await api.sendMessage(
        getLang("returnListPending", list.length, msg),
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            });
          }
        },
        messageID
      );

      setTimeout(() => global.GoatBot.onReply.delete(replyMsg.messageID), 5 * 60 * 1000);

    } catch (err) {
      console.error(err);
      api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  },

  onReply: async function({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    const args = body.trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    if (!["approve", "cancel"].includes(action)) {
      return api.sendMessage(getLang("noSelection"), threadID, messageID);
    }

    const numbers = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));
    if (!numbers.length) return api.sendMessage(getLang("invalidNumber", "sélection vide"), threadID, messageID);

    const invalidNumbers = numbers.filter(n => n <= 0 || n > Reply.pending.length);
    if (invalidNumbers.length) return api.sendMessage(getLang("invalidNumber", invalidNumbers.join(", ")), threadID, messageID);

    const selectedGroups = numbers.map(n => Reply.pending[n - 1]);
    let successCount = 0;

    for (const g of selectedGroups) {
      try {
        if (action === "approve") {
          await api.sendMessage(
            "🔔 | Notification de groupe\n─────────────────\n» Ce groupe a été approuvé par l'administrateur.",
            g.threadID
          );
        } else {
          await api.removeUserFromGroup(api.getCurrentUserID(), g.threadID);
        }
        successCount++;
      } catch (err) {
        console.error(`Échec du traitement du groupe ${g.threadID}:`, err);
      }
    }

    const resultMsg = action === "approve"
      ? getLang("approveSuccess", successCount)
      : getLang("cancelSuccess", successCount);

    api.sendMessage(resultMsg, threadID, messageID);
    global.GoatBot.onReply.delete(Reply.messageID);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
