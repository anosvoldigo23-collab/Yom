const { getTime } = global.utils;
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "warn",
    version: "2.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: {
      fr: "⚠️ Avertit les membres d’un groupe. Au bout de 3 avertissements, le membre est automatiquement banni."
    },
    category: "🧰 𝗕𝗢𝗫",
    guide: {
      fr: `
✨ Commandes warn :
• {pn} @tag <raison> : avertit un membre
• {pn} list : affiche la liste des membres avertis
• {pn} listban : affiche la liste des membres bannis après 3 avertissements
• {pn} info [@tag | <uid> | reply | vide] : affiche les infos d’avertissement
• {pn} unban [@tag | <uid> | reply | vide] : débannit le membre et supprime ses avertissements
• {pn} unwarn [@tag | <uid> | reply | vide] [<numéro> | vide] : supprime un avertissement par numéro ou le dernier si vide
• {pn} reset : réinitialise toutes les données d’avertissements

⚠️ Le bot doit être administrateur pour expulser automatiquement les membres bannis
      `.trim()
    },
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    fr: {
      list: "📜 Liste des membres avertis :\n%1\n\nPour plus de détails : « %2warn info [@tag | <uid> | vide] »",
      listBan: "🚫 Membres bannis après 3 avertissements :\n%1",
      listEmpty: "✅ Aucun membre n’a encore été averti.",
      listBanEmpty: "✅ Aucun membre n’a encore été banni.",
      invalidUid: "⚠️ Veuillez entrer un UID valide.",
      noData: "❌ Aucune donnée disponible.",
      noPermission: "❌ Seuls les administrateurs peuvent débannir un membre.",
      notBanned: "⚠️ L’utilisateur %1 n’est pas banni.",
      unbanSuccess: "✅ [%1 | %2] a été débanni et peut rejoindre le groupe.",
      warnSuccess: "⚠️ %1 a reçu son %2ᵉ avertissement\n- UID : %3\n- Raison : %4\n- Date & Heure : %5\nCe membre a atteint 3 avertissements et a été banni.",
      warnSuccess2: "⚠️ %1 a reçu son %2ᵉ avertissement\n- UID : %3\n- Raison : %4\n- Date & Heure : %5\nEncore %6 avertissement(s) avant bannissement.",
      hasBanned: "⚠️ Membres déjà bannis après 3 avertissements :\n%1",
      failedKick: "⚠️ Erreur lors de l’expulsion :\n%1",
      userNotInGroup: "⚠️ L’utilisateur « %1 » n’est pas présent dans le groupe."
    }
  },

  onStart: async function({ message, api, event, args, threadsData, usersData, role, getLang }) {
    if (!args[0]) return message.SyntaxError();
    const { threadID, senderID } = event;
    const warnList = await threadsData.get(threadID, "data.warn", []);

    const header = "⚠️ 𝗪𝗔𝗥𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 ⚠️";

    switch (args[0].toLowerCase()) {
      case "list": {
        const msg = await Promise.all(warnList.map(async user => {
          const name = await usersData.getName(user.uid);
          return `• ${name} (${user.uid}) : ${user.list.length} avertissement(s)`;
        }));
        return message.reply(msg.length ? `${header}\n\n${msg.join("\n")}` : getLang("listEmpty"));
      }

      case "listban": {
        const banned = (await Promise.all(warnList.map(async user => {
          if (user.list.length >= 3) {
            const name = await usersData.getName(user.uid);
            return `• ${name} (${user.uid})`;
          }
        }))).filter(Boolean);
        return message.reply(banned.length ? `${header}\n\n${banned.join("\n")}` : getLang("listBanEmpty"));
      }

      case "info": {
        let uids;
        if (Object.keys(event.mentions).length) uids = Object.keys(event.mentions);
        else if (event.messageReply?.senderID) uids = [event.messageReply.senderID];
        else if (args.slice(1).length) uids = args.slice(1);
        else uids = [senderID];

        const msg = (await Promise.all(uids.map(async uid => {
          const dataWarn = warnList.find(u => u.uid == uid);
          const name = await usersData.getName(uid);
          let out = `• Nom : ${name}\n• UID : ${uid}`;
          if (!dataWarn || dataWarn.list.length === 0) out += `\n${getLang("noData")}`;
          else {
            out += "\nAvertissements :";
            dataWarn.list.forEach((warn, i) => {
              out += `\n  ${i + 1}. Raison : ${warn.reason}\n     Date : ${warn.dateTime}`;
            });
          }
          return out;
        }))).filter(Boolean).join("\n\n");

        return message.reply(`${header}\n\n${msg}`);
      }

      default: {
        if (role < 1) return message.reply("❌ Seuls les admins peuvent avertir un membre.");
        let uid, reason;

        if (event.messageReply) {
          uid = event.messageReply.senderID;
          reason = args.join(" ").trim();
        } else if (Object.keys(event.mentions)[0]) {
          uid = Object.keys(event.mentions)[0];
          reason = args.join(" ").replace(event.mentions[uid], "").trim();
        } else return message.reply("⚠️ Vous devez taguer ou répondre à un membre.");

        if (!reason) reason = "Aucune raison spécifiée";

        const userData = warnList.find(item => item.uid == uid);
        const dateTime = getTime("DD/MM/YYYY HH:mm:ss");
        if (!userData) warnList.push({ uid, list: [{ reason, dateTime, warnBy: senderID }] });
        else userData.list.push({ reason, dateTime, warnBy: senderID });

        await threadsData.set(threadID, warnList, "data.warn");
        const times = userData?.list.length ?? 1;
        const userName = await usersData.getName(uid);

        if (times >= 3) {
          message.reply(`${header}\n\n${getLang("warnSuccess", userName, times, uid, reason, dateTime)}`, () => {
            api.removeUserFromGroup(uid, threadID, err => {
              if (err) message.reply("⚠️ Le bot doit être admin pour expulser ce membre.");
            });
          });
        } else {
          message.reply(`${header}\n\n${getLang("warnSuccess2", userName, times, uid, reason, dateTime, 3 - times)}`);
        }
      }
    }
  },

  onEvent: async ({ event, threadsData, usersData, message, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;
    const { threadID, logMessageData } = event;
    const data = await threadsData.get(threadID);
    const warnList = data.warn || [];
    if (!warnList.length) return;

    const hasBanned = [];
    for (const user of logMessageData.addedParticipants) {
      const uid = user.userFbId;
      const dataWarn = warnList.find(u => u.uid == uid);
      if (dataWarn && dataWarn.list.length >= 3) {
        const name = await usersData.getName(uid);
        hasBanned.push({ uid, name });
      }
    }

    if (hasBanned.length) {
      await message.send(`${getLang("hasBanned", hasBanned.map(u => `• ${u.name} (${u.uid})`).join("\n"))}`);
      for (const user of hasBanned) {
        try { await api.removeUserFromGroup(user.uid, threadID); }
        catch (e) { message.reply(`${getLang("failedKick", `${user.name} (${user.uid})`)}`); }
      }
    }
  }
};

// ⚡ Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
