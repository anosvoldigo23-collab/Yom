const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "uid",
    version: "1.4",
    author: "NTKhang + Christus",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: "🆔 Obtenir l'ID Facebook d'un utilisateur",
    longDescription: "Permet de récupérer l'UID Facebook d'un utilisateur via tag, lien de profil ou message reply",
    guide: "{pn} → voir ton UID\n{pn} @tag → voir l'UID d'une personne taguée\n{pn} <lien profil> → voir l'UID depuis le lien\nRépondre à un message avec la commande pour voir l'UID de l'auteur",
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    vi: {
      syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
    },
    en: {
      syntaxError: "Please tag the person you want to view uid or leave it blank to view your own uid"
    }
  },

  onStart: async function({ message, event, args, getLang }) {
    const { messageReply, mentions, senderID } = event;

    // ✅ Reply à un message
    if (messageReply) {
      return message.reply(`┌─🆔 UID ─────────────┐\n💡 Reply detected\nUID : ${messageReply.senderID}\n└───────────────────┘`);
    }

    // ✅ Aucun argument → retourne UID de soi-même
    if (!args[0]) {
      return message.reply(`┌─🆔 UID ─────────────┐\n💡 Ton UID : ${senderID}\n└───────────────────┘`);
    }

    // ✅ Vérifie si c'est un lien de profil Facebook
    if (args[0].match(regExCheckURL)) {
      let msg = "┌─🖥️  UID depuis liens ─────────────┐\n";
      for (const link of args) {
        try {
          const uid = await findUid(link);
          msg += `${link} => ${uid}\n`;
        } catch (e) {
          msg += `${link} (ERROR) => ${e.message}\n`;
        }
      }
      msg += "└──────────────────────────────┘";
      return message.reply(msg);
    }

    // ✅ Si mention(s)
    if (mentions && Object.keys(mentions).length) {
      let msg = "┌─🆔 UID des mentions ─────────────┐\n";
      for (const id in mentions) {
        msg += `${mentions[id].replace("@", "")} : ${id}\n`;
      }
      msg += "└──────────────────────────────┘";
      return message.reply(msg);
    }

    // ❌ Sinon, erreur de syntaxe
    return message.reply(getLang("syntaxError"));
  }
};

// 🟢 Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
