const { getStreamsFromAttachment, log } = global.utils;
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports.config = {
  name: "callad",
  version: "2.0",
  author: "NTKhang x Christus",
  countDown: 5,
  role: 0,
  description: {
    fr: "📝 Envoyer un rapport, feedback ou signalement à l'admin du bot",
    en: "📝 Send report, feedback or bug to bot admin"
  },
  category: "contacts admin",
  guide: {
    fr: "{pn} <votre message>",
    en: "{pn} <your message>"
  },
  noPrefix: true // Activation noprefix
};

module.exports.onStart = async function({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
  const { config } = global.GoatBot;
  if (!args[0]) return message.reply(getLang("missingMessage"));

  const { senderID, threadID, isGroup } = event;
  if (!config.adminBot || config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

  const senderName = await usersData.getName(senderID);
  const threadName = isGroup ? (await threadsData.get(threadID)).threadName : null;

  // Message encadré et stylé
  const header = "📨✨  CALL ADMIN  ✨📨";
  const userInfo = `👤 Nom : ${senderName}\n🆔 ID : ${senderID}`;
  const groupInfo = isGroup ? `🏷️ Groupe : ${threadName}\n🆔 Thread : ${threadID}` : "🏷️ Message envoyé par utilisateur";
  const content = args.join(" ");

  const fullMessage = `${header}\n─────────────────────────\n${userInfo}\n${groupInfo}\n─────────────────────────\n📝 Contenu :\n${content}\n─────────────────────────`;

  const attachments = await getStreamsFromAttachment(
    [...event.attachments, ...(event.messageReply?.attachments || [])].filter(a => mediaTypes.includes(a.type))
  );

  const formMessage = {
    body: fullMessage,
    mentions: [{ id: senderID, tag: senderName }],
    attachment: attachments
  };

  const successIDs = [];
  const failedIDs = [];

  const adminNames = await Promise.all(config.adminBot.map(async id => ({ id, name: await usersData.getName(id) })));

  for (const adminID of config.adminBot) {
    try {
      const sentMsg = await api.sendMessage(formMessage, adminID);
      successIDs.push(adminID);
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName,
        messageID: sentMsg.messageID,
        threadID,
        messageIDSender: event.messageID,
        type: "userCallAdmin"
      });
    } catch (err) {
      failedIDs.push({ adminID, error: err });
    }
  }

  let replyMsg = "";
  if (successIDs.length) replyMsg += `✅ Message envoyé avec succès à :\n${adminNames.filter(a => successIDs.includes(a.id)).map(a => `- ${a.name} (<@${a.id}>)`).join("\n")}\n`;
  if (failedIDs.length) {
    replyMsg += `❌ Échec pour :\n${failedIDs.map(f => `- ${adminNames.find(a => a.id === f.adminID)?.name || f.adminID}`).join("\n")}\n`;
    log.err("CALL ADMIN", failedIDs);
  }

  message.reply({ body: replyMsg, mentions: adminNames.map(a => ({ id: a.id, tag: a.name })) });
};

module.exports.onReply = async function({ args, event, api, message, Reply, usersData, commandName, getLang }) {
  const { type, threadID, messageIDSender } = Reply;
  const senderName = await usersData.getName(event.senderID);
  const { isGroup } = event;

  const attachments = await getStreamsFromAttachment(
    event.attachments.filter(a => mediaTypes.includes(a.type))
  );

  if (type === "userCallAdmin") {
    const form = {
      body: getLang("reply", senderName, args.join(" ")),
      mentions: [{ id: event.senderID, tag: senderName }],
      attachment: attachments
    };

    api.sendMessage(form, threadID, (err, info) => {
      if (err) return message.err(err);
      message.reply(getLang("replyUserSuccess"));
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        messageIDSender: event.messageID,
        threadID,
        type: "adminReply"
      });
    }, messageIDSender);

  } else if (type === "adminReply") {
    let groupInfo = "";
    if (isGroup) {
      const { threadName } = await api.getThreadInfo(event.threadID);
      groupInfo = getLang("sendByGroup", threadName, event.threadID);
    }

    const form = {
      body: getLang("feedback", senderName, event.senderID, groupInfo, args.join(" ")),
      mentions: [{ id: event.senderID, tag: senderName }],
      attachment: attachments
    };

    api.sendMessage(form, threadID, (err, info) => {
      if (err) return message.err(err);
      message.reply(getLang("replySuccess"));
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        messageIDSender: event.messageID,
        threadID,
        type: "userCallAdmin"
      });
    }, messageIDSender);
  }
};

// Activation du mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
