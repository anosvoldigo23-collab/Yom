const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "admin",
    version: "2.1",
    author: "NTKhang x Christus",
    countDown: 5,
    role: 2,
    description: "👑 Gestion des admins : ajouter, supprimer ou lister",
    category: "box chat",
    guide: "{pn} [add | -a] <uid|@tag>\n{pn} [remove | -r] <uid|@tag>\n{pn} [list | -l]",
    noPrefix: true // Activation noprefix
  },

  langs: {
    fr: {
      added: "✅ | **Permissions admin ajoutées** pour %1 utilisateur(s) :\n────────────────────────────\n%2\n────────────────────────────",
      alreadyAdmin: "⚠️ | Ces utilisateurs avaient déjà les permissions admin :\n────────────────────────────\n%1\n────────────────────────────",
      missingIdAdd: "⚠️ | Veuillez entrer l'ID ou tag de l'utilisateur à ajouter",
      removed: "✅ | **Permissions admin supprimées** pour %1 utilisateur(s) :\n────────────────────────────\n%2\n────────────────────────────",
      notAdmin: "⚠️ | Ces utilisateurs n'étaient pas admin :\n────────────────────────────\n%1\n────────────────────────────",
      missingIdRemove: "⚠️ | Veuillez entrer l'ID ou tag de l'utilisateur à supprimer",
      listAdmin: "👑 | **Liste des admins** :\n────────────────────────────\n%1\n────────────────────────────"
    }
  },

  onStart: async function({ message, args, usersData, event, getLang }) {
    const action = args[0];

    const sendDecoratedMessage = (text) => {
      return message.reply(`📌💠══════════════════════💠📌\n${text}\n📌💠══════════════════════💠📌`);
    };

    // Ajouter admin
    if (["add", "-a"].includes(action)) {
      if (!args[1]) return sendDecoratedMessage(getLang("missingIdAdd"));

      let uids = [];
      if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else if (event.messageReply) uids.push(event.messageReply.senderID);
      else uids = args.slice(1).filter(arg => !isNaN(arg));

      const notAdminIds = [];
      const adminIds = [];

      for (const uid of uids) {
        config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
      }

      config.adminBot.push(...notAdminIds);
      const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let msg = "";
      if (notAdminIds.length)
        msg += getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(u => `• ${u.name} (${u.uid})`).join("\n"));
      if (adminIds.length)
        msg += "\n" + getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n"));

      return sendDecoratedMessage(msg);
    }

    // Supprimer admin
    if (["remove", "-r"].includes(action)) {
      if (!args[1]) return sendDecoratedMessage(getLang("missingIdRemove"));

      let uids = [];
      if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else uids = args.slice(1).filter(arg => !isNaN(arg));

      const notAdminIds = [];
      const adminIds = [];

      for (const uid of uids) {
        config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
      }

      for (const uid of adminIds) config.adminBot.splice(config.adminBot.indexOf(uid), 1);
      const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let msg = "";
      if (adminIds.length)
        msg += getLang("removed", adminIds.length, getNames.map(u => `• ${u.name} (${u.uid})`).join("\n"));
      if (notAdminIds.length)
        msg += "\n" + getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n"));

      return sendDecoratedMessage(msg);
    }

    // Lister les admins
    if (["list", "-l"].includes(action)) {
      const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
      return sendDecoratedMessage(getLang("listAdmin", getNames.join("\n")));
    }

    // Syntaxe invalide
    return message.SyntaxError();
  }
};

// Activation noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
