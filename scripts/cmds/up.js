const os = require("os");
const fs = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

const startTime = new Date();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    author: "Christus",
    countDown: 0,
    role: 0,
    category: "system",
    shortDescription: "💥 Affiche le bot et stats du système",
    longDescription: "Obtiens toutes les infos du bot et du système, façon pro gamer!",
    noPrefix: true
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;
      const d = Math.floor(uptimeInSeconds / (3600 * 24));
      const h = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((uptimeInSeconds % 3600) / 60);
      const s = Math.floor(uptimeInSeconds % 60);
      const uptime = `${d}d ${h}h ${m}m ${s}s`;

      const totalMem = os.totalmem() / 1024 / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024 / 1024;
      const usedMem = totalMem - freeMem;

      const cpuModel = os.cpus()[0].model;
      const cpuUsage = os.cpus().map(c => c.times.user).reduce((a, b) => a + b) / os.cpus().length;

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const waitingMsg = await api.sendMessage("⚡ Chargement des stats…", event.threadID);
      const ping = Date.now() - waitingMsg.timestamp;
      const status = ping < 1000 ? "🟢 Smooth" : "🔴 Laggy";

      const info = `
╔════════════════════╗
║ 💪 𝗖𝗛𝗘𝗖𝗞 𝗬𝗢𝗨𝗥 𝗕𝗢𝗧 💪
╠════════════════════╣
║ ⏱ Runtime : ${uptime}
║ 🖥 OS : ${os.type()} ${os.arch()}
║ 🧠 CPU : ${cpuModel} | Usage: ${cpuUsage.toFixed(2)}%
║ 🖤 Node.js : ${process.version}
║ 💾 RAM : ${usedMem.toFixed(2)} / ${totalMem.toFixed(2)} GB
╠════════════════════╣
║ 👥 Users : ${allUsers.length}
║ 🏘 Threads : ${allThreads.length}
║ 📶 Ping : ${ping}ms | Status: ${status}
╚════════════════════╝
🔥 Keep it cool, bro! 🔥
`;

      await api.unsendMessage(waitingMsg.messageID);
      api.sendMessage({ body: info }, event.threadID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de récupérer les infos du bot.", event.threadID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
