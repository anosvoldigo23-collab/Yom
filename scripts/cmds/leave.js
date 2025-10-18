const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "leave",
    version: "1.2",
    author: "Christus x Aesther",
    countDown: 10,
    role: 2, // Owner only
    category: "owner",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: { en: "Liste les groupes et quitte le groupe sélectionné" },
    longDescription: { en: "Affiche les groupes où le bot est membre et quitte le groupe choisi." },
    guide: { en: "Répondez avec un numéro pour que le bot quitte le groupe.\n'next'/'prev' pour naviguer entre les pages." }
  },

  onStart: async function({ api, message, threadsData, event }) {
    const allThreads = await threadsData.getAll();
    const groups = allThreads.filter(t => t.isGroup);
    if (!groups.length) return message.reply("❌ 𝐀𝐮𝐜𝐮𝐧 𝐠𝐫𝐨𝐮𝐩𝐞 𝐭𝐫𝐨𝐮𝐯é.");

    const page = 1, perPage = 8, totalPages = Math.ceil(groups.length / perPage);
    const msg = await this.renderPage(api, groups, page, perPage, totalPages);

    return message.reply(msg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        groups,
        page,
        perPage,
        totalPages
      });
    });
  },

  onReply: async function({ api, message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const body = event.body.trim().toLowerCase();

    if (body === "next" || body === "prev") {
      let newPage = Reply.page;
      if (body === "next" && Reply.page < Reply.totalPages) newPage++;
      else if (body === "prev" && Reply.page > 1) newPage--;

      const msg = await this.renderPage(api, Reply.groups, newPage, Reply.perPage, Reply.totalPages);
      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, { ...Reply, page: newPage });
      });
    }

    const choice = parseInt(body);
    if (isNaN(choice)) return message.reply("❌ 𝐄𝐧𝐭𝐫é𝐞 𝐢𝐧𝐯𝐚𝐥𝐢𝐝𝐞. 𝐑é𝐩𝐨𝐧𝐝𝐞𝐳 𝐚𝐯𝐞𝐜 𝐮𝐧 𝐧ú𝐦é𝐫𝐨, 'next' ou 'prev'.");

    const index = (Reply.page - 1) * Reply.perPage + (choice - 1);
    if (index < 0 || index >= Reply.groups.length) return message.reply("❌ 𝐂𝐡𝐨𝐢𝐱 𝐢𝐧𝐯𝐚𝐥𝐢𝐝𝐞.");

    const selectedGroup = Reply.groups[index];
    const threadID = selectedGroup.threadID;

    try {
      const info = await api.getThreadInfo(threadID);
      const memberCount = info.participantIDs.length;

      const goodbyeMsg = `
╔═══════════════════════════
║ 👋 𝐁𝐨𝐭 𝐋𝐞𝐚𝐯𝐢𝐧𝐠
╠═══════════════════════════
║ 📌 𝐆𝐫𝐨𝐮𝐩𝐞 : ${info.threadName || "𝐒𝐚𝐧𝐬 𝐧𝐨𝐦"}
║ 🆔 𝐈𝐃 : ${threadID}
║ 👥 𝐌𝐞𝐦𝐛𝐫𝐞𝐬 : ${memberCount}
╚═══════════════════════════
🙏 𝐌𝐞𝐫𝐜𝐢 𝐩𝐨𝐮𝐫 𝐭𝐨𝐮𝐭 !`;

      await api.sendMessage(goodbyeMsg, threadID);
      await api.removeUserFromGroup(api.getCurrentUserID(), threadID);

      return message.reply(`✅ 𝐋𝐞 𝐛𝐨𝐭 𝐚 𝐪𝐮𝐢𝐭𝐭é 𝐥𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 : ${info.threadName || "𝐒𝐚𝐧𝐬 𝐧𝐨𝐦"} (${threadID})`);
    } catch (err) {
      return message.reply(`❌ 𝐄𝐫𝐫𝐞𝐮𝐫 𝐞𝐧 𝐪𝐮𝐢𝐭𝐭𝐚𝐧𝐭 𝐥𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 : ${err.message}`);
    }
  },

  renderPage: async function(api, groups, page, perPage, totalPages) {
    let msg = `📦 𝐆𝐫𝐨𝐮𝐩𝐞𝐬 𝐨𝐮̀ 𝐥𝐞 𝐁𝐨𝐭 𝐞𝐬𝐭 𝐦𝐞𝐦𝐛𝐫𝐞 (Page ${page}/${totalPages})\n\n`;
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, groups.length);

    for (let i = start; i < end; i++) {
      const g = groups[i];
      try {
        const info = await api.getThreadInfo(g.threadID);
        const approval = info.approvalMode ? "✅ 𝐀𝐩𝐩𝐫𝐨𝐮𝐯é" : "❌ 𝐍𝐨𝐧 𝐚𝐩𝐩𝐫𝐨𝐮𝐯é";
        msg += `${i - start + 1}. ${g.threadName || "𝐒𝐚𝐧𝐬 𝐧𝐨𝐦"}\n🆔 ${g.threadID}\n👥 𝐌𝐞𝐦𝐛𝐫𝐞𝐬: ${info.participantIDs.length}\n🔐 ${approval}\n\n`;
      } catch {
        msg += `${i - start + 1}. ${g.threadName || "𝐒𝐚𝐧𝐬 𝐧𝐨𝐦"}\n🆔 ${g.threadID}\n⚠️ 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐥𝐞 𝐝𝐞 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐞𝐫 𝐥𝐞𝐬 𝐢𝐧𝐟𝐨𝐬\n\n`;
      }
    }

    msg += `👉 𝐑é𝐩𝐨𝐧𝐝𝐞𝐳 𝐚𝐯𝐞𝐜 𝐮𝐧 𝐧ú𝐦é𝐫𝐨 𝐩𝐨𝐮𝐫 𝐪𝐮𝐢𝐭𝐭𝐞𝐫 𝐥𝐞 𝐠𝐫𝐨𝐮𝐩𝐞.\n`;
    if (page < totalPages) msg += `➡️ 𝐑é𝐩𝐨𝐧𝐝𝐞𝐳 "next" 𝐩𝐨𝐮𝐫 𝐥𝐚 𝐩𝐚𝐠𝐞 𝐬𝐮𝐢𝐯𝐚𝐧𝐭𝐞.\n`;
    if (page > 1) msg += `⬅️ 𝐑é𝐩𝐨𝐧𝐝𝐞𝐳 "prev" 𝐩𝐨𝐮𝐫 𝐥𝐚 𝐩𝐚𝐠𝐞 𝐩𝐫é𝐜𝐞𝐝𝐞𝐧𝐭𝐞.\n`;

    return msg;
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
