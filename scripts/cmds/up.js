const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const g = require('fca-aryan-nix'); // Pour noprefix

module.exports = {
  config: {
    name: "Up",
    version: "2.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Affiche les stats du bot et du système en mode stylé",
    longDescription: "Affiche uptime, utilisateurs, groupes, OS, CPU, RAM, disque et GIF aléatoire dans un joli cadre.",
    category: "𝗦𝗬𝗦𝗧𝗘𝗠",
    noPrefix: true,
    ai: false
  },

  onStart: async function ({ message, event, api, usersData, threadsData }) {
    try {
      // GIF aléatoire
      const gifs = [
        "https://i.ibb.co/Gk4MzRf/image.gif",
        "https://i.ibb.co/nj0ysh5/image.gif"
      ];
      const gifURL = gifs[Math.floor(Math.random() * gifs.length)];
      const gifAttachment = await global.utils.getStreamFromURL(gifURL);

      // Uptime
      const uptimeSec = process.uptime();
      const s = Math.floor(uptimeSec % 60);
      const m = Math.floor((uptimeSec / 60) % 60);
      const h = Math.floor((uptimeSec / 3600) % 24);
      const upSt = `${h}H ${m}M ${s}S`;

      // Thread info
      const threadInfo = await api.getThreadInfo(event.threadID);
      const genderCounts = { boys: 0, girls: 0, unknown: 0 };
      for (let uid in threadInfo.userInfo) {
        const gend = threadInfo.userInfo[uid].gender;
        if (gend === "MALE") genderCounts.boys++;
        else if (gend === "FEMALE") genderCounts.girls++;
        else genderCounts.unknown++;
      }

      // Users & groups
      const users = await usersData.getAll();
      const groups = await threadsData.getAll();

      // OS info
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const cpuInfo = os.cpus()[0];
      const diskUsage = await getDiskUsage();

      // Format message avec police stylée 𝐶
      const statsMsg = `
╔══════════════════════╗
║ 🖥 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐒 🖥
╠══════════════════════╣
║ 🏃 𝐔𝐩𝐭𝐢𝐦𝐞: ${upSt}
║ 👦 𝐁𝐨𝐲𝐬: ${genderCounts.boys} | 👧 𝐆𝐢𝐫𝐥𝐬: ${genderCounts.girls} | ❓ 𝐔𝐧𝐤𝐧𝐨𝐰𝐧: ${genderCounts.unknown}
║ 🏘 𝐆𝐫𝐨𝐮𝐩𝐬: ${groups.length} | 👪 𝐔𝐬𝐞𝐫𝐬: ${users.length}
╠══════════════════════╣
║ 💻 𝐎𝐒: ${os.platform()} ${os.release()}
║ 🖥 𝐌𝐨𝐝𝐞𝐥: ${cpuInfo.model} | ⚙ 𝐂𝐨𝐫𝐞𝐬: ${os.cpus().length} | 𝐀𝐫𝐜𝐡: ${os.arch()}
║ 💾 𝐌𝐞𝐦𝐨𝐫𝐲: ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)} ${generateProgressBar((usedMemory/totalMemory)*100)}
║ 📀 𝐃𝐢𝐬𝐤: ${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)} ${generateProgressBar((diskUsage.used/diskUsage.total)*100)}
╚══════════════════════╝
`;

      // Envoi message avec GIF
      message.reply({ body: statsMsg, attachment: gifAttachment }, event.threadID);

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération des stats système.", event.threadID);
    }
  }
};

// Fonctions utilitaires
async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function prettyBytes(bytes) {
  const units = ['B','KB','MB','GB','TB'];
  let i = 0;
  while(bytes >= 1024 && i < units.length-1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function generateProgressBar(percent) {
  const total = 10;
  const filled = Math.ceil((percent/100)*total);
  return `[${'█'.repeat(filled)}${'▒'.repeat(total-filled)}]`;
}

// Activation noprefix
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
