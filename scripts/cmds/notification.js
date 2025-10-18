const { getStreamsFromAttachment } = global.utils;
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.8",
    author: "NTKhang x Christus",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "📢 Envoie une notification à tous les groupes",
    longDescription: "Permet à l'admin d'envoyer un message à tous les groupes où le bot est présent, avec un affichage élégant.",
    guide: { en: "notification <message>" },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, api, event, args, commandName, envCommands, threadsData }) {
    const { delayPerGroup = 250 } = envCommands[commandName] || {};

    if (!args[0]) return message.reply("⚠ Veuillez entrer le message à envoyer à tous les groupes.");

    const formSend = {
      body: `📢 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐝𝐞 𝐥'𝐚𝐝𝐦𝐢𝐧\n──────────────────────────\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    message.reply(`⏳ 𝐃é𝐛𝐮𝐭 𝐝𝐞 𝐥'𝐞𝐧𝐯𝐨𝐢 𝐚𝐮𝐱 ${allThreadID.length} 𝐠𝐫𝐨𝐮𝐩𝐞𝐬...`);

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        waitingSend.push({ threadID: tid, pending: api.sendMessage(formSend, tid) });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      } catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({ threadIDs: [sended.threadID], errorDescription });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    // Création d’un message encadré et esthétique
    let msg = `
╔═════════════════════════════════
║ 📬 𝐁𝐢𝐥𝐚𝐧 𝐝𝐞 𝐥'𝐞𝐧𝐯𝐨𝐢 𝐝𝐞 𝐧𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧
╠═════════════════════════════════
║ ✅ Groupes réussis : ${sendSuccess}
`;

    if (sendError.length > 0) {
      msg += `║ ❌ Groupes échoués : ${sendError.reduce((a, b) => a + b.threadIDs.length, 0)}\n`;
      sendError.forEach(err => {
        msg += `║   - ${err.errorDescription}\n`;
        msg += `║     + ${err.threadIDs.join("\n║       + ")}\n`;
      });
    }

    msg += `╚═════════════════════════════════`;

    message.reply(msg.trim());
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
