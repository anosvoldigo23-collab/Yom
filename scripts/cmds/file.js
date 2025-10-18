const fs = require("fs");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "filecmd",
    aliases: ["file"],
    version: "1.1",
    author: "Christus",
    countDown: 5,
    role: 2,
    shortDescription: "Voir le code d'une commande",
    longDescription: "Permet de visualiser le code source brut de n'importe quelle commande dans le dossier des commandes",
    category: "owner",
    guide: "{pn} <nomDeLaCommande>",
    noPrefix: true
  },

  onStart: async function ({ args, message }) {
    const cmdName = args[0];
    if (!cmdName) return message.reply(
      "❌ | Veuillez fournir le nom de la commande.\nExemple : filecmd fluxsnell"
    );

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return message.reply(
      `❌ | La commande "${cmdName}" est introuvable dans ce dossier.`
    );

    try {
      const code = fs.readFileSync(cmdPath, "utf8");

      if (code.length > 19000) {
        return message.reply(
          "⚠️ | Ce fichier est trop volumineux pour être affiché directement."
        );
      }

      return message.reply({
        body: `📄 | Code source de "${cmdName}.js":\n\n\`\`\`js\n${code}\n\`\`\``
      });
    } catch (err) {
      console.error("Erreur filecmd :", err);
      return message.reply("❌ | Une erreur est survenue lors de la lecture du fichier.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
