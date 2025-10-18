const axios = require('axios');

const nix = 'http://65.109.80.126:20409';

module.exports.config = {
  name: "meta",
  version: "0.0.1",
  role: 0,
  author: "Christus",
  description: "Meta AI",
  category: "général",
  cooldowns: 2,
  hasPrefix: false,
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(' ').trim();

  if (!question) {
    return api.sendMessage("❗ Pose ta question pour que Meta AI puisse te répondre.", threadID, messageID);
  }

  try {
    const response = await axios.get(`${nix}/aryan/meta-ai?query=${encodeURIComponent(question)}`);
    const metaAnswer = response.data?.data;

    if (metaAnswer) {
      // Envoie la réponse dans un petit encadré pour plus de lisibilité
      const formattedAnswer = `📬 𝐑𝐞𝐩𝐨𝐧𝐬𝐞 𝐝𝐞 𝐌𝐞𝐭𝐚 𝐀𝐈 :\n─────────────────\n${metaAnswer}`;
      return api.sendMessage(formattedAnswer, threadID, messageID);
    } else {
      return api.sendMessage("⚠️ 𝐐𝐮𝐞𝐥𝐪𝐮𝐞 𝐜𝐡𝐨𝐬𝐞 𝐬'𝐞𝐬𝐭 𝐦𝐚𝐥 𝐩𝐚𝐬𝐬é.", threadID, messageID);
    }
  } catch (error) {
    console.error('Erreur API Meta:', error.response ? error.response.data : error.message);
    return api.sendMessage("❌ 𝐄𝐫𝐫𝐞𝐮𝐫 𝐬𝐞𝐫𝐯𝐞𝐮𝐫, ne réessaie pas tout de suite.", threadID, messageID);
  }
};
