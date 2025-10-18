const axios = require('axios');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix
const defaultEmojiTranslate = "🌐";

module.exports = {
  config: {
    name: "translate",
    version: "1.6",
    author: "NTKhang + Christus",
    countDown: 5,
    role: 0,
    category: "utility",
    shortDescription: "🌐 Traduit du texte dans la langue désirée",
    longDescription: "Traduit rapidement du texte ou le contenu d'un message en réponse, avec possibilité d'activation automatique via réaction.",
    guide: "{pn} Bonjour -> vi → traduit 'Bonjour' en vietnamien\n{pn} -r on/off → active/désactive la traduction par réaction\n{pn} -r set <emoji> → définit l'emoji déclencheur",
    usePrefix: false,
    noPrefix: true
  },

  langs: {
    vi: {
      translateTo: "🌐 Traduction de %1 vers %2",
      invalidArgument: "❌ Argument invalide, utilisez 'on' ou 'off'",
      turnOnTransWhenReaction: `✅ Traduction par réaction activée ! Réagissez avec "${defaultEmojiTranslate}" pour traduire (messages postérieurs uniquement).`,
      turnOffTransWhenReaction: "✅ Traduction par réaction désactivée.",
      inputEmoji: "🌀 Réagissez à ce message pour définir l'emoji déclencheur.",
      emojiSet: "✅ Emoji de traduction défini sur %1"
    },
    en: {
      translateTo: "🌐 Translate from %1 to %2",
      invalidArgument: "❌ Invalid argument, choose 'on' or 'off'",
      turnOnTransWhenReaction: `✅ Auto-translate on! React with "${defaultEmojiTranslate}" to translate messages (only messages after activation).`,
      turnOffTransWhenReaction: "✅ Auto-translate off.",
      inputEmoji: "🌀 React to this message to set the emoji trigger.",
      emojiSet: "✅ Translation emoji set to %1"
    }
  },

  onStart: async function({ message, event, args, threadsData, getLang, commandName }) {
    // 🔧 Gestion des options de réaction
    if (["-r", "-react", "-reaction"].includes(args[0])) {
      if (args[1] === "set") {
        return message.reply(getLang("inputEmoji"), (err, info) =>
          global.GoatBot.onReaction.set(info.messageID, {
            type: "setEmoji",
            commandName,
            messageID: info.messageID,
            authorID: event.senderID
          })
        );
      }
      const isEnable = args[1] === "on" ? true : args[1] === "off" ? false : null;
      if (isEnable === null) return message.reply(getLang("invalidArgument"));
      await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
      return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
    }

    // 🔤 Gestion de la traduction
    let content = event.messageReply ? event.messageReply.body : event.body;
    let langCodeTrans = content.includes("->") || content.includes("=>") ?
      content.split(/->|=>/).pop().trim() : await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
    content = content.split(/->|=>/)[0].trim();

    if (!content) return message.SyntaxError();
    await translateAndSendMessage(content, langCodeTrans, message, getLang);
  },

  onChat: async ({ event, threadsData }) => {
    if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction")) return;
    global.GoatBot.onReaction.set(event.messageID, {
      commandName: 'translate',
      messageID: event.messageID,
      body: event.body,
      type: "translate"
    });
  },

  onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
    switch (Reaction.type) {
      case "setEmoji": {
        if (event.userID !== Reaction.authorID) return;
        const emoji = event.reaction;
        if (!emoji) return;
        await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
        return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
      }
      case "translate": {
        const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || defaultEmojiTranslate;
        if (event.reaction === emojiTrans) {
          const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
          const content = Reaction.body;
          Reaction.delete();
          await translateAndSendMessage(content, langCodeTrans, message, getLang);
        }
      }
    }
  }
};

// 🌐 Fonction de traduction via Google Translate
async function translate(text, langCode) {
  const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
  return { text: res.data[0].map(item => item[0]).join(''), lang: res.data[2] };
}

// ✨ Envoie le message traduit avec joli format
async function translateAndSendMessage(content, langCodeTrans, message, getLang) {
  const { text, lang } = await translate(content.trim(), langCodeTrans.trim());
  return message.reply(`┌─🌐 𝗧𝗿𝗮𝗻𝘀𝗹𝗮𝘁𝗲 ─────────────┐\n│ Texte : ${content}\n│ Traduction : ${text}\n└─────────────────────────┘\n${getLang("translateTo", lang, langCodeTrans)}`);
}

// 🟢 Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
