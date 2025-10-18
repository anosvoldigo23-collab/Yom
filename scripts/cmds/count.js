const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "count",
    version: "1.3",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      fr: "Voir le nombre de messages de tous les membres ou de vous-même (depuis l'arrivée du bot dans le groupe)"
    },
    category: "discussion",
    guide: {
      fr: "{pn}: voir le nombre de vos messages\n{pn} @tag: voir le nombre de messages des personnes taguées\n{pn} all: voir le nombre de messages de tous les membres"
    },
    noPrefix: true // Activation noprefix
  },

  langs: {
    fr: {
      count: "📊 Nombre de messages des membres :",
      endMessage: "⚠️ Les personnes non listées n'ont pas encore envoyé de messages.",
      page: "📄 Page [%1/%2]",
      reply: "💬 Répondez à ce message avec le numéro de page pour voir la suite",
      result: "🏅 %1 est classé %2 avec %3 messages",
      yourResult: "🙋‍♂️ Vous êtes classé %1 et avez envoyé %2 messages dans ce groupe",
      invalidPage: "❌ Numéro de page invalide"
    }
  },

  onStart: async function ({ args, threadsData, message, event, api, commandName, getLang }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const members = threadData.members || [];
    const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

    let arraySort = members
      .filter(user => usersInGroup.includes(user.userID))
      .map(user => ({ name: user.name, count: user.count, uid: user.userID, stt: 0 }));

    let stt = 1;
    arraySort.sort((a, b) => b.count - a.count).forEach(item => item.stt = stt++);

    if (args[0]) {
      if (args[0].toLowerCase() === "all") {
        let msg = getLang("count");
        const endMessage = getLang("endMessage");
        for (const item of arraySort) if (item.count > 0) msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
        return message.reply(msg + `\n${endMessage}`);
      } else if (event.mentions) {
        let msg = "";
        for (const id in event.mentions) {
          const findUser = arraySort.find(item => item.uid == id);
          if (findUser) msg += `\n${getLang("result", findUser.name, findUser.stt, findUser.count)}`;
        }
        return message.reply(msg);
      }
    } else {
      const findUser = arraySort.find(item => item.uid == senderID);
      return message.reply(getLang("yourResult", findUser.stt, findUser.count));
    }
  },

  onReply: ({ message, event, Reply, commandName, getLang }) => {
    const { senderID, body } = event;
    const { author, splitPage } = Reply;
    if (author != senderID) return;

    const page = parseInt(body);
    if (isNaN(page) || page < 1 || page > splitPage.totalPage)
      return message.reply(getLang("invalidPage"));

    let msg = getLang("count");
    const arraySort = splitPage.allPage[page - 1];
    for (const item of arraySort) if (item.count > 0) msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
    message.reply(msg);
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    const members = await threadsData.get(threadID, "members") || [];
    const findMember = members.find(user => user.userID == senderID);
    if (!findMember) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        nickname: null,
        inGroup: true,
        count: 1
      });
    } else {
      findMember.count += 1;
    }
    await threadsData.set(threadID, members, "members");
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
