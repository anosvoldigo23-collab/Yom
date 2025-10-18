const fs = require('fs');
const path = require('path');
const axios = require('axios');
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

const baseApiUrl = async () => {
  const base = await axios.get('https://raw.githubusercontent.com/Saim12678/Saim/main/baseApiUrl.json');
  return base.data.api;
};

module.exports = {
  config: {
    name: "gist",
    version: "2.1",
    role: 4,
    author: "Christus",
    usePrefix: false, // Désactive le préfixe
    description: "Génère un lien Gist à partir du code en réponse ou de fichiers locaux du bot",
    category: "convert",
    guide: {
      en: "{pn} → Répondre à un extrait de code pour créer un Gist\n{pn} [nom_fichier] → Créer un Gist à partir du dossier cmds\n{pn} -e [nom_fichier] → Créer un Gist à partir du dossier events"
    },
    countDown: 1,
    noPrefix: true
  },

  onStart: async function ({ api, event, args }) {
    let fileName = args[0];
    let code = "";

    try {
      if (event.type === "message_reply" && event.messageReply?.body) {
        code = event.messageReply.body;
        if (!fileName) {
          const time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
          fileName = `gist_${time}.js`;
        } else if (!fileName.endsWith(".js")) {
          fileName = `${fileName}.js`;
        }
      } else if (fileName) {
        let filePath;
        if (args[0] === "-e") {
          const evFile = args[1];
          if (!evFile) return api.sendMessage("⚠ | Veuillez fournir un nom de fichier après -e.", event.threadID, event.messageID);
          fileName = evFile.endsWith(".js") ? evFile : `${evFile}.js`;
          filePath = path.resolve(__dirname, '../../scripts/events', fileName);
        } else {
          const commandsPath = path.resolve(__dirname, '../../scripts/cmds');
          filePath = fileName.endsWith(".js") ? path.join(commandsPath, fileName) : path.join(commandsPath, `${fileName}.js`);
        }

        if (!fs.existsSync(filePath)) {
          const dirToSearch = args[0] === "-e" ? path.resolve(__dirname, '../../scripts/events') : path.resolve(__dirname, '../../scripts/cmds');
          const files = fs.readdirSync(dirToSearch);
          const similar = files.filter(f => f.toLowerCase().includes(fileName.replace(".js", "").toLowerCase()));
          if (similar.length > 0) return api.sendMessage(`❌ Fichier non trouvé. Vouliez-vous dire :\n${similar.join('\n')}`, event.threadID, event.messageID);
          return api.sendMessage(`❌ Fichier "${fileName}" non trouvé dans le dossier ${args[0] === "-e" ? "events" : "cmds"}.`, event.threadID, event.messageID);
        }

        code = await fs.promises.readFile(filePath, "utf-8");
        if (!fileName.endsWith(".js")) fileName = `${fileName}.js`;
      } else {
        return api.sendMessage("⚠ | Veuillez répondre avec du code OU fournir un nom de fichier.", event.threadID, event.messageID);
      }

      const encoded = encodeURIComponent(code);
      const apiUrl = await baseApiUrl();

      const response = await axios.post(`${apiUrl}/gist`, { code: encoded, nam: fileName });
      const link = response.data?.data;
      if (!link) throw new Error("Invalid API response");

      const gistMsg = `
━━━━━━━━━━━━━━
𝐆𝐢𝐬𝐭 𝐂𝐫éé ✅
╭─╼━━━━━━━━╾─╮
│ Fichier : ${fileName}
│ Statut : Succès
│ Lien : ${link}
╰─━━━━━━━━━╾─╯
━━━━━━━━━━━━━━
`;
      return api.sendMessage(gistMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ Gist Error:", err.message || err);
      return api.sendMessage(
        "⚠️ Échec de la création du gist. Problème possible du serveur.\n💬 Contactez l'auteur pour de l'aide: https://m.me/ye.bi.nobi.tai.244493",
        event.threadID,
        event.messageID
      );
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
      const gistMsg = `
━━━━━━━━━━━━━━
𝐆𝐢𝐬𝐭 𝐂𝐫éé ✅
╭─╼━━━━━━━━╾─╮
│ Fichier : ${fileName}
│ Statut : Succès
│ Lien : ${link}
╰─━━━━━━━━━╾─╯
━━━━━━━━━━━━━━
`;

      return api.sendMessage(gistMsg, event.threadID, event.messageID); // Envoie le message avec le lien du gist
    } catch (err) {
      console.error("❌ Gist Error:", err.message || err); // Affiche l'erreur dans la console
      return api.sendMessage(
        "⚠️ Échec de la création du gist. Problème possible du serveur.\n💬 Contactez l'auteur pour de l'aide: https://m.me/ye.bi.nobi.tai.244493",
        event.threadID,
        event.messageID
      ); // Envoie un message d'erreur à l'utilisateur en cas d'échec
    }
  }
};
