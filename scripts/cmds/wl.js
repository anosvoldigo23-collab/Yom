const { config } = global.GoatBot;
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "wl",
    version: "2.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    longDescription: {
      fr: "✨ Gérer facilement les whiteListIds avec style et fun ✨"
    },
    category: "𝗔𝗗𝗠𝗜𝗡",
    guide: {
      fr:
        '{pn} add <uid | @tag> : Ajouter un utilisateur à la whiteList\n' +
        '{pn} remove <uid | @tag> : Retirer un utilisateur de la whiteList\n' +
        '{pn} list : Voir tous les admins en whiteList\n' +
        '{pn} on / off : Activer ou désactiver le mode whiteList'
    },
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    fr: {
      added: "✅ | 🎉 WhiteList ajoutée pour %1 utilisateur(s) :\n%2",
      alreadyAdmin: "⚠ | Les utilisateurs suivants étaient déjà dans la WhiteList :\n%1",
      missingIdAdd: "⚠ | Veuillez fournir un ID ou taguer l'utilisateur pour l'ajouter à la WhiteList",
      removed: "✅ | 🗑️ WhiteList retirée pour %1 utilisateur(s) :\n%2",
      notAdmin: "⚠ | Les utilisateurs suivants n'étaient pas dans la WhiteList :\n%1",
      missingIdRemove: "⚠ | Veuillez fournir un ID ou taguer l'utilisateur à retirer de la WhiteList",
      listAdmin: "👑 | Liste des utilisateurs en WhiteList :\n%1",
      enable: "✅ | 💡 Mode WhiteList activé. Tous les nouveaux membres non listés seront bloqués !",
      disable: "✅ | ❌ Mode WhiteList désactivé. Tout le monde peut rejoindre maintenant.",
      syntaxError: "⚠ | Commande invalide ! Vérifie la syntaxe."
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const action = args[0]?.toLowerCase();

    const formatUsers = async (uids) => {
      const names = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
      return names.map(({ uid, name }) => `• ${name} (${uid})`).join("\n");
    };

    switch (action) {
      case "add": {
        if (!args[1]) return message.reply(getLang("missingIdAdd"));

        let uids = Object.keys(event.mentions).length ? Object.keys(event.mentions) :
                   event.messageReply ? [event.messageReply.senderID] :
                   args.slice(1).filter(arg => !isNaN(arg));

        const notAdmins = [];
        const alreadyAdmins = [];

        for (const uid of uids) {
          if (config.whiteListMode.whiteListIds.includes(uid)) alreadyAdmins.push(uid);
          else notAdmins.push(uid);
        }

        config.whiteListMode.whiteListIds.push(...notAdmins);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const msg = 
          (notAdmins.length ? `${getLang("added", notAdmins.length, await formatUsers(notAdmins))}\n` : "") +
          (alreadyAdmins.length ? `${getLang("alreadyAdmin", alreadyAdmins.length, await formatUsers(alreadyAdmins))}` : "");

        return message.reply(`
┌─🎯 WHITE LIST ACTION ──────────────┐
${msg}
└───────────────────────────────────┘
        `);
      }

      case "remove": {
        if (!args[1]) return message.reply(getLang("missingIdRemove"));

        let uids = Object.keys(event.mentions).length ? Object.keys(event.mentions) :
                   event.messageReply ? [event.messageReply.senderID] :
                   args.slice(1).filter(arg => !isNaN(arg));

        const removed = [];
        const notFound = [];

        for (const uid of uids) {
          if (config.whiteListMode.whiteListIds.includes(uid)) {
            config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
            removed.push(uid);
          } else notFound.push(uid);
        }

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const msg = 
          (removed.length ? `${getLang("removed", removed.length, await formatUsers(removed))}\n` : "") +
          (notFound.length ? `${getLang("notAdmin", notFound.length, await formatUsers(notFound))}` : "");

        return message.reply(`
┌─🗑️ WHITE LIST ACTION ──────────────┐
${msg}
└───────────────────────────────────┘
        `);
      }

      case "list": {
        const admins = await formatUsers(config.whiteListMode.whiteListIds);
        return message.reply(`
┌─👑 WHITE LIST ADMINS ──────────────┐
${admins || "Aucun utilisateur en WhiteList."}
└───────────────────────────────────┘
        `);
      }

      case "on": {
        config.whiteListMode.enable = true;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(`✅ | 💡 Mode WhiteList activé !`);
      }

      case "off": {
        config.whiteListMode.enable = false;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(`✅ | ❌ Mode WhiteList désactivé !`);
      }

      default:
        return message.reply(getLang("syntaxError"));
    }
  }
};

// ⚡ Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
