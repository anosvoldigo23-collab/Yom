const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "2.0",
    author: "NTKhang x Christus",
    countDown: 5,
    role: 0,
    description: {
      fr: "📝 Envoyer un rapport, feedback ou bug à l'admin du bot",
      en: "📝 Send report, feedback, or bug to bot admin"
    },
    category: "contacts admin",
    guide: {
      fr: "{pn} <votre message>",
      en: "{pn} <your message>"
    },
    noPrefix: true // active le mode noprefix
  },

  langs: {
    fr: {
      missingMessage: "⚠ Veuillez entrer le message que vous voulez envoyer à l'admin",
      sendByGroup: "\n🏷 Groupe : %1\n🆔 Thread ID : %2",
      sendByUser: "\n🏷 Message envoyé par utilisateur",
      content: "\n─────────────────────────\n📝 Contenu :\n%1\n─────────────────────────\n💡 Répondez à ce message pour répondre à l'utilisateur",
      success: "✅ Message envoyé à %1 admin avec succès !\n%2",
      failed: "❌ Erreur lors de l'envoi à %1 admin\n%2\n🔍 Vérifiez la console pour plus de détails",
      reply: "📩 Réponse de l'admin %1 :\n─────────────────────────\n%2\n─────────────────────────\n💡 Répondez à ce message pour continuer la conversation",
      replySuccess: "✅ Votre réponse a été envoyée à l'admin avec succès !",
      feedback: "📝 Feedback de %1 :\n- User ID : %2%3\n\n─────────────────────────\n%4\n─────────────────────────\n💡 Répondez à ce message pour répondre à l'utilisateur",
      replyUserSuccess: "✅ Votre réponse a été envoyée à l'utilisateur avec succès !",
      noAdmin: "⚠ Le bot n'a actuellement aucun admin"
    },
    en: {
      missingMessage: "⚠ Please enter the message you want to send to admin",
      sendByGroup: "\n🏷 Group : %1\n🆔 Thread ID : %2",
      sendByUser: "\n🏷 Sent from user",
      content: "\n─────────────────────────\n📝 Content:\n%1\n─────────────────────────\n💡 Reply to this message to respond to user",
      success: "✅ Message sent to %1 admin successfully!\n%2",
      failed: "❌ Failed to send message to %1 admin\n%2\n🔍 Check console for more details",
      reply: "📩 Reply from admin %1:\n─────────────────────────\n%2\n─────────────────────────\n💡 Reply to this message to continue conversation",
      replySuccess: "✅ Your reply has been sent to admin successfully!",
      feedback: "📝 Feedback from user %1:\n- User ID : %2%3\n\n─────────────────────────\n%4\n─────────────────────────\n💡 Reply to this message to respond to user",
      replyUserSuccess: "✅ Your reply has been sent to user successfully!",
      noAdmin: "⚠ Bot has no admin at the moment"
    }
  },

  onStart: async function({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;

    if (!args[0]) return message.reply(getLang("missingMessage"));

    const { senderID, threadID, isGroup } = event;
    if (!config.adminBot || config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

    const senderName = await usersData.getName(senderID);
    const threadName = isGroup ? (await threadsData.get(threadID)).threadName : null;

    // Message stylé avec emojis et encadrements
    const header = "📨✨ CALL ADMIN ✨📨";
    const userInfo = `👤 Nom : ${senderName}\n🆔 ID : ${senderID}`;
    const groupInfo = isGroup ? getLang("sendByGroup", threadName, threadID) : getLang("sendByUser");
    const content = args.join(" ");

    const fullMessage = `${header}\n─────────────────────────\n${userInfo}${groupInfo}\n─────────────────────────\n📝 Contenu :\n${content}\n─────────────────────────`;

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
    if (successIDs.length) replyMsg += getLang("success", successIDs.length, adminNames.filter(a => successIDs.includes(a.id)).map(a => `- ${a.name} (<@${a.id}>)`).join("\n"));
    if (failedIDs.length) {
      replyMsg += getLang("failed", failedIDs.length, failedIDs.map(f => `- ${adminNames.find(a => a.id === f.adminID)?.name || f.adminID}`).join("\n"));
      log.err("CALL ADMIN", failedIDs);
    }

    message.reply({ body: replyMsg, mentions: adminNames.map(a => ({ id: a.id, tag: a.name })) });
  },

  onReply: async function({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const { isGroup } = event;

    const attachments = await getStreamsFromAttachment(event.attachments.filter(a => mediaTypes.includes(a.type)));

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
          threadID: event.threadID,
          type: "userCallAdmin"
        });
      }, messageIDSender);
    }
  }
};
