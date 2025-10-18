const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "promouvoir",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 1,
    category: "discussion de groupe",
    shortDescription: "𝐴𝐣𝐨𝐮𝐭𝐞𝐫 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐞𝐮𝐫 𝐝𝐞 𝐠𝐫𝐨𝐮𝐩𝐞",
    longDescription: "𝐴𝐣𝐨𝐮𝐭𝐞 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐧𝐞 𝐪𝐮𝐞 𝐯𝐨𝐮𝐬 𝐭𝐚𝐠𝐮𝐞𝐳 𝐞𝐧 𝐭𝐚𝐧𝐭 𝐪𝐮𝐞 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐞𝐮𝐫 𝐝𝐮 𝐠𝐫𝐨𝐮𝐩𝐞.",
    guide: {
      en: "{n} [@mention]",
    },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function ({ api, event }) {
    const mentions = Object.keys(event.mentions);
    
    if (!mentions[0]) return api.sendMessage("❌ 𝐕𝐨𝐮𝐬 𝐝𝐞𝐯𝐞𝐳 𝐭𝐚𝐠𝐮𝐞𝐫 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐧𝐞 𝐚 𝐩𝐫𝐨𝐦𝐨𝐮𝐯𝐫𝐞.", event.threadID, event.messageID);

    api.getThreadInfo(event.threadID, (err, info) => {
      if (err) return api.sendMessage("❌ 𝐔𝐧𝐞 𝐞𝐫𝐫𝐞𝐮𝐫 𝐬'𝐞𝐬𝐭 𝐩𝐫𝐨𝐝𝐮𝐢𝐭𝐞 !", event.threadID, event.messageID);

      const botID = api.getCurrentUserID();

      if (!info.adminIDs.some(admin => admin.id == botID)) {
        return api.sendMessage(
          "❌ 𝐁𝐞𝐬𝐨𝐢𝐧 𝐝𝐞 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐝'𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐞𝐮𝐫 𝐝𝐮 𝐠𝐫𝐨𝐮𝐩𝐞.\n𝐀𝐣𝐨𝐮𝐭𝐞𝐳 𝐥𝐞 𝐛𝐨𝐭 𝐞𝐭 𝐫𝐞𝐞𝐬𝐬𝐚𝐲𝐞𝐳 !",
          event.threadID,
          event.messageID
        );
      }

      if (!info.adminIDs.some(admin => admin.id == event.senderID)) {
        return api.sendMessage("❌ 𝐕𝐨𝐮𝐬 𝐝𝐞𝐯𝐞𝐳 𝐞̂𝐭𝐫𝐞 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐞𝐮𝐫 𝐩𝐨𝐮𝐫 𝐮𝐭𝐢𝐥𝐢𝐬𝐞𝐫 𝐜𝐞𝐭𝐭𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐞.", event.threadID, event.messageID);
      }

      mentions.forEach((id, index) => {
        setTimeout(() => {
          api.changeAdminStatus(event.threadID, id, true, (error) => {
            if (error) {
              console.error(error);
              api.sendMessage(`❌ 𝐄𝐫𝐫𝐞𝐮𝐫 𝐩𝐨𝐮𝐫 𝐩𝐫𝐨𝐦𝐨𝐭𝐞𝐫 𝐥'𝐮𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐞𝐮𝐫 𝐢𝐝: ${id}`, event.threadID);
            } else {
              api.sendMessage(`✅ 𝐋'𝐮𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐞𝐮𝐫 <@${id}> 𝐚 𝐞́𝐭𝐞́ 𝐩𝐫𝐨𝐦𝐮 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐞𝐮𝐫 !`, event.threadID, event.messageID, { mentions: [{ tag: `<@${id}>`, id }] });
            }
          });
        }, index * 2000); // délai entre chaque promotion
      });
    });
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
