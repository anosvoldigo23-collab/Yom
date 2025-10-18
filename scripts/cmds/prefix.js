const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: "🎯 𝐌𝐨𝐝𝐢𝐟𝐢𝐞 𝐥𝐞 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐮 𝐛𝐨𝐭 𝐝𝐚𝐧𝐬 𝐥𝐞 𝐜𝐡𝐚𝐭 𝐨𝐮 𝐠𝐥𝐨𝐛𝐚𝐥𝐞𝐦𝐞𝐧𝐭",
    category: "🛠️ 𝐒𝐲𝐬𝐭𝐞̀𝐦𝐞",
    guide: {
      en:
`╭─『 ✨ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 ✨ 』
│
│ 🔸 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 :
│   ➥ {pn} <𝐧𝐨𝐮𝐯𝐞𝐚𝐮 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞>
│   ⤷ 𝐌𝐨𝐝𝐢𝐟𝐢𝐞 𝐥𝐞 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐚𝐧𝐬 𝐜𝐞 𝐜𝐡𝐚𝐭
│   ✍️ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞 : {pn} $
│
│ 🌐 {pn} <𝐧𝐨𝐮𝐯𝐞𝐚𝐮 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞> -g
│   ⤷ 𝐌𝐨𝐝𝐢𝐟𝐢𝐞 𝐥𝐞 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐠𝐥𝐨𝐛𝐚𝐥𝐞 (𝐀𝐝𝐦𝐢𝐧)
│   ✍️ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞 : {pn} ! -g
│
│ ♻️ {pn} reset
│   ⤷ 𝐑𝐞́𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐬𝐞 𝐚𝐮 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐞́𝐟𝐚𝐮𝐭
│
│ 📌 𝐓𝐚𝐩𝐞 : prefix
│   ⤷ 𝐀𝐟𝐟𝐢𝐜𝐡𝐞 𝐥𝐞𝐬 𝐢𝐧𝐟𝐨𝐬 𝐝𝐞 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞
╰───────────────────────────────`
    }
  },

  langs: {
    en: {
      reset: "✅ 𝐑𝐞́𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐬𝐞́ 𝐚𝐮 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐞́𝐟𝐚𝐮𝐭 : %1",
      onlyAdmin: "⛔ 𝐒𝐞𝐮𝐥𝐬 𝐥𝐞𝐬 𝐚𝐝𝐦𝐢𝐧𝐬 𝐩𝐞𝐮𝐯𝐞𝐧𝐭 𝐜𝐡𝐚𝐧𝐠𝐞𝐫 𝐥𝐞 𝐩𝐫𝐞́𝐟𝐢𝐱𝐞 𝐠𝐥𝐨𝐛𝐚𝐥𝐞 !",
      confirmGlobal: "⚙️ 𝐑𝐞́𝐚𝐠𝐢𝐬 𝐩𝐨𝐮𝐫 𝐜𝐨𝐧𝐟𝐢𝐫𝐦𝐞𝐫 𝐥𝐚 𝐦𝐢𝐬𝐞 𝐚̀ 𝐣𝐨𝐮𝐫 𝐠𝐥𝐨𝐛𝐚𝐥𝐞 🌐",
      confirmThisThread: "⚙️ 𝐑𝐞́𝐚𝐠𝐢𝐬 𝐩𝐨𝐮𝐫 𝐜𝐨𝐧𝐟𝐢𝐫𝐦𝐞𝐫 𝐥𝐚 𝐦𝐢𝐬𝐞 𝐚̀ 𝐣𝐨𝐮𝐫 𝐝𝐚𝐧𝐬 𝐜𝐞 𝐜𝐡𝐚𝐭 💬",
      successGlobal: "✅ 𝐏𝐫𝐞́𝐟𝐢𝐱𝐞 𝐠𝐥𝐨𝐛𝐚𝐥𝐞 𝐦𝐢𝐬 𝐚̀ 𝐣𝐨𝐮𝐫 : %1",
      successThisThread: "✅ 𝐏𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐮 𝐜𝐡𝐚𝐭 𝐦𝐢𝐬 𝐚̀ 𝐣𝐨𝐮𝐫 : %1"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    // 🔄 Réinitialisation du préfixe
    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmMessage, (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },

  // 📌 Réponse automatique quand on tape "prefix"
  onChat: async function ({ event, message, threadsData, usersData }) {
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;

    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);

      return message.reply(
`╭─『 👑 𝐈𝐍𝐅𝐎𝐒 𝐏𝐑𝐄𝐅𝐈𝐗𝐄 』
│ 👤 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐞𝐮𝐫 : ${userName}
│ 🌐 𝐏𝐫𝐞́𝐟𝐢𝐱𝐞 𝐆𝐥𝐨𝐛𝐚𝐥𝐞 : ${globalPrefix}
│ 💬 𝐏𝐫𝐞́𝐟𝐢𝐱𝐞 𝐝𝐮 𝐆𝐫𝐨𝐮𝐩𝐞 : ${threadPrefix}
╰───────────────────────────────
✨ 𝐁𝐨𝐭 : 𝐶𝐻𝑅𝐼𝑆𝑇𝑈𝑆_𝐵𝑂𝑇 ✨`
      );
    }
  }
};
