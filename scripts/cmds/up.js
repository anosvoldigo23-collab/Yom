const os = require('os');
const { bold } = require("fontstyles");
const g = require('fca-aryan-nix'); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: 'uptime',
    aliases: ['stats', 'up', 'system', 'rtm'],
    version: '2.0',
    usePrefix: false, // Noprefix activé
    author: 'Christus',
    countDown: 15,
    role: 0,
    shortDescription: '🚀 Affiche les stats du bot et du système avec vérification des médias',
    longDescription: 'Affiche l’uptime du bot, la mémoire, CPU, réseau et statut media ban, de manière stylée',
    category: 'system',
    noPrefix: true
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    if (this.config.author !== 'Christus') return message.reply("⚠️ Changement d'auteur détecté. Exécution stoppée.");

    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();

    try {
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);

      const cpuUsage = os.loadavg();
      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;
      const nodeVersion = process.version;
      const platform = os.platform();
      const networkInterfaces = os.networkInterfaces();

      const networkInfo = Object.keys(networkInterfaces).map(iface => ({
        iface,
        addresses: networkInterfaces[iface].map(info => `${info.family}: ${info.address}`)
      }));

      const endTime = Date.now();
      const botPing = endTime - startTime;
      const totalMessages = users.reduce((sum, u) => sum + (u.messageCount || 0), 0);
      const mediaBan = await threadsData.get(event.threadID, 'mediaBan') || false;
      const mediaBanStatus = mediaBan ? '🚫 Media est actuellement interdit ici' : '✅ Media autorisé';

      const uptimeResponse = uptime > 86400 ? "💪 Je tourne depuis un moment déjà !" : "😎 Je viens juste de démarrer !";

      const editSegments = [
        `🖥 ${bold("Système")}:\n• Uptime : ${days}d ${hours}h ${minutes}m ${seconds}s\n• RAM utilisée : ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        `• RAM totale : ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n• RAM libre : ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n• Usage RAM : ${memoryUsagePercentage}%\n• CPU 1m : ${cpuUsage[0].toFixed(2)}%`,
        `• CPU 5m : ${cpuUsage[1].toFixed(2)}%\n• CPU 15m : ${cpuUsage[2].toFixed(2)}%\n• Cœurs : ${cpuCores}\n• Modèle CPU : ${cpuModel}`,
        `• Node.js : ${nodeVersion}\n• Platform : ${platform}\n• Ping : ${botPing}ms\n• Utilisateurs : ${users.length}\n• Groupes : ${groups.length}`,
        `• Messages traités : ${totalMessages}\n${mediaBanStatus}\n\n🌐 ${bold("Réseau")}:\n${networkInfo.map(info => `• ${info.iface}: ${info.addresses.join(', ')}`).join('\n')}\n\n${uptimeResponse}`
      ];

      const loadingFrames = [
        '⏳ Chargement.\n[█▒▒▒▒▒▒▒▒▒]',
        '⏳ Chargement..\n[██▒▒▒▒▒▒▒]',
        '⏳ Chargement...\n[████▒▒▒▒▒]',
        '⏳ Chargement...\n[███████▒▒]',
        '✅ Chargé !\n[█████████]'
      ];

      let sentMessage = await message.reply("⚡ Initialisation des stats du bot...");

      const editMessage = (index) => {
        if (index < editSegments.length) {
          const content = `${loadingFrames[index]}\n\n${editSegments.slice(0, index + 1).join('\n\n')}`;
          api.editMessage(content, sentMessage.messageID);
          setTimeout(() => editMessage(index + 1), 700);
        }
      };

      editMessage(0);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue lors de la récupération des stats du système.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
