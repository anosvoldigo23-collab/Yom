// 👑 Commande USER (Gestion des utilisateurs)
// ──────────────────────────────────────────────
const { getTime } = global.utils;
const g = require("fca-aryan-nix"); // 🟡 GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "user",
    version: "1.5",
    author: "NTKhang  | Modifié par Christus",
    countDown: 5,
    role: 2,
    category: "👑 owner",
    shortDescription: "👤 Gestion des utilisateurs",
    longDescription: "Permet de rechercher, bannir ou débannir des utilisateurs dans la base de données du bot.",
    guide: {
      fr:
        "╭─『 👤 𝗚𝗘𝗦𝗧𝗜𝗢𝗡 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗘𝗨𝗥 』\n" +
        "│\n" +
        "│ 🔍 user find <nom> → Rechercher un utilisateur\n" +
        "│ 🚫 user ban <uid | @tag | reply> <raison> → Bannir un utilisateur\n" +
        "│ ✅ user unban <uid | @tag | reply> → Débannir un utilisateur\n" +
        "╰─────────────────────────────",
    },
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    fr: {
      noUserFound: "❌ Aucun utilisateur trouvé avec le nom \"%1\" dans la base de données.",
      userFound: "🔎 %1 utilisateur(s) trouvé(s) pour \"%2\" :\n%3",
      uidRequired: "⚠️ Merci de préciser un UID, tag ou reply un message.",
      reasonRequired: "⚠️ Merci de préciser une raison pour le bannissement.",
      userHasBanned: "⛔ L'utilisateur [%1 | %2] est déjà banni :\n» Raison : %3\n» Date : %4",
      userBanned: "🚫 L'utilisateur [%1 | %2] a été banni.\n» Raison : %3\n» Date : %4",
      uidRequiredUnban: "⚠️ UID nécessaire pour débannir.",
      userNotBanned: "ℹ️ L'utilisateur [%1 | %2] n'est pas banni.",
      userUnbanned: "✅ L'utilisateur [%1 | %2] a été débanni."
    },
    en: {
      noUserFound: "❌ No user found with name \"%1\".",
      userFound: "🔎 Found %1 user(s) for \"%2\" :\n%3",
      uidRequired: "⚠️ UID, tag or reply required.",
      reasonRequired: "⚠️ Please provide a reason for banning.",
      userHasBanned: "⛔ User [%1 | %2] is already banned:\n» Reason: %3\n» Date: %4",
      userBanned: "🚫 User [%1 | %2] has been banned.\n» Reason: %3\n» Date: %4",
      uidRequiredUnban: "⚠️ UID required to unban.",
      userNotBanned: "ℹ️ User [%1 | %2] is not banned.",
      userUnbanned: "✅ User [%1 | %2] has been unbanned."
    }
  },

  onStart: async function ({ args, usersData, message, event, getLang }) {
    const type = args[0];

    switch (type) {
      // 🔍 Recherche utilisateur
      case "find":
      case "-f":
      case "search":
      case "-s": {
        const keyWord = args.slice(1).join(" ");
        const allUser = await usersData.getAll();
        const result = allUser.filter(item =>
          (item.name || "").toLowerCase().includes(keyWord.toLowerCase())
        );

        const msg = result.reduce(
          (i, user) => i += `\n╭ Nom : ${user.name}\n╰ ID : ${user.userID}`,
          ""
        );

        message.reply(
          result.length === 0
            ? getLang("noUserFound", keyWord)
            : getLang("userFound", result.length, keyWord, msg)
        );
        break;
      }

      // 🚫 Bannir utilisateur
      case "ban":
      case "-b": {
        let uid, reason;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
          reason = args.slice(1).join(" ");
        } else if (Object.keys(event.mentions).length > 0) {
          const { mentions } = event;
          uid = Object.keys(mentions)[0];
          reason = args.slice(1).join(" ").replace(mentions[uid], "");
        } else if (args[1]) {
          uid = args[1];
          reason = args.slice(2).join(" ");
        } else {
          return message.reply(getLang("uidRequired"));
        }

        if (!uid) return message.reply(getLang("uidRequired"));
        if (!reason) return message.reply(getLang("reasonRequired"));

        const userData = await usersData.get(uid);
        const name = userData.name;
        const status = userData.banned.status;

        if (status) {
          return message.reply(getLang(
            "userHasBanned",
            uid,
            name,
            userData.banned.reason,
            userData.banned.date
          ));
        }

        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await usersData.set(uid, {
          banned: { status: true, reason, date: time }
        });

        message.reply(getLang("userBanned", uid, name, reason, time));
        break;
      }

      // ✅ Débannir utilisateur
      case "unban":
      case "-u": {
        let uid;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
        } else if (args[1]) {
          uid = args[1];
        } else {
          return message.reply(getLang("uidRequiredUnban"));
        }

        const userData = await usersData.get(uid);
        const name = userData.name;
        const status = userData.banned.status;

        if (!status) return message.reply(getLang("userNotBanned", uid, name));

        await usersData.set(uid, { banned: {} });
        message.reply(getLang("userUnbanned", uid, name));
        break;
      }

      default:
        return message.reply("⚠️ Utilisation incorrecte. Tape `user` pour voir la syntaxe.");
    }
  }
};

// 🟡 Activation du mode noprefix
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
