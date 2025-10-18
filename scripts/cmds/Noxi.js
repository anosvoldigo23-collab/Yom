const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // Import GoatWrapper

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  config: {
    name: "noxi",
    version: "6.3",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Recherche et téléchargement de vidéos Noxi",
    longDescription: "Recherche + navigation stylisée avec téléchargement individuel ou multiple",
    category: "nsfw",
    guide: {
      fr: "{p}noxi <mot-clé> → recherche Noxi\n→ réponds avec numéro, 'all', 'next' ou 'prev'"
    },
    noPrefix: true // Noprefix activé
  },

  onStart: async function ({ message, args, event, api }) {
    const query = args.join(" ");
    if (!query) return;

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/search/xnxxsearch?query=${encodeURIComponent(query)}`);
      const data = res.data.data;
      if (!data || data.length === 0) return;

      const pageSize = 9;
      const page = 1;
      const totalPages = Math.ceil(data.length / pageSize);

      const styled = renderPage(data, query, page, pageSize, totalPages);
      const msg = await message.reply(styled);

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "noxi",
        author: event.senderID,
        data,
        query,
        page,
        pageSize
      });
    } catch (e) {
      console.error(e);
    }
  },

  onReply: async function ({ event, api, message, Reply }) {
    const { data, author, query, page, pageSize } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.trim().toLowerCase();
    const totalPages = Math.ceil(data.length / pageSize);
    let newPage = page;

    if (input === "next") newPage++;
    else if (input === "prev") newPage--;
    else if (input === "all") {
      for (const item of data.slice(0, 9)) {
        try {
          const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(item.link)}`);
          const video = dl.data.data;
          const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);

          const processingMsg = await api.sendMessage({ body: `📥 Téléchargement vidéo #${data.indexOf(item)+1}...` }, event.threadID);
          await global.utils.downloadFile(video.download.low, filePath);
          await api.unsendMessage(processingMsg.messageID);

          await api.sendMessage({
            body: `✅ Vidéo #${data.indexOf(item)+1} terminée\n🎞『 ${video.title} 』\n👁 Vues: ${video.views} | ⏳ Durée: ${video.duration} | ⚙ Qualité: basse`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));

          await api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (err) {
          await api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
      }
      return;
    } else {
      const parts = input.split(" ");
      const num = parseInt(parts[0]);
      const quality = parts[1] || "low";

      if (!num || num < 1 || num > data.length) return;

      try {
        const processingMsg = await api.sendMessage({ body: `📥 Téléchargement vidéo #${num} [${quality}]...` }, event.threadID);
        const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(data[num-1].link)}`);
        const video = dl.data.data;
        const availableQualities = Object.keys(video.download || {}).join(", ");

        if (!video.download?.[quality]) {
          await api.unsendMessage(processingMsg.messageID);
          return;
        }

        const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);
        await global.utils.downloadFile(video.download[quality], filePath);
        await api.unsendMessage(processingMsg.messageID);

        await api.sendMessage({
          body: `✅ Vidéo #${num} [${quality}] terminée\n🎌『 ${video.title} 』\n👁 Vues: ${video.views} | ⏳ Durée: ${video.duration}\n⚙ Qualité: ${quality}\nAutres qualités: ${availableQualities}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));

        await api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch (err) {
        await api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return;
    }

    if (newPage < 1 || newPage > totalPages) return;
    const styled = renderPage(data, query, newPage, pageSize, totalPages);
    const msg = await message.reply(styled);
    global.GoatBot.onReply.set(msg.messageID, { commandName: "noxi", author, data, query, page: newPage, pageSize });
  }
};

// -------------------
// Fonctions d'affichage
// -------------------

function formatViews(views) {
  if (!views) return "0";
  if (typeof views === "string") views = views.replace(/[^\d.]/g, "");
  views = Number(views);
  if (isNaN(views)) return "0";
  if (views >= 1e6) return (views/1e6).toFixed(1).replace(/\.0$/,"")+"M";
  if (views >= 1e3) return (views/1e3).toFixed(1).replace(/\.0$/,"")+"k";
  return views.toString();
}

function renderPage(data, query, page, pageSize, totalPages) {
  const start = (page-1)*pageSize;
  const pageData = data.slice(start, start+pageSize);

  const list = pageData.map((item,i)=>{
    const views=formatViews(item.views);
    const percentage="100%";
    const qualities="low, high";
    const author=item.author?item.author.trim():"";
    const duration=item.duration||"";
    const authorDuration=author?`${author.padEnd(20," ")}${duration}`:duration;
    return `🎌 ${start+i+1}. 『 ${item.title} 』\n👁 ${views} 💯 ${percentage} 🕒 ${authorDuration}\n⚙ Qualités : ${qualities}`;
  }).join("\n\n");

  return `📺 𝗥𝗘𝗦𝗨𝗟𝗧𝗔𝗧𝗦 𝗡𝗢𝗫𝗜 🔞 (Page ${page}/${totalPages})\n━━━━━━━━━━━━━━━━━━\n🔍 Mot-clé : *${query}*\n\n${list}\n━━━━━━━━━━━━━━━━━━\n📥 Réponds avec :\n• un numéro (1-${data.length}) + optionnellement "low", "high", "hd"\n• Exemple : "2 hd" ou "1"\n• "all" pour tout recevoir\n• "next" ou "prev" pour naviguer.`;
}

// -------------------
// Activation noprefix
// -------------------
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
