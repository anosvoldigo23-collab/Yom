const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "help",
    aliases: ["commands", "cmds", "liste"],
    version: "0.0.2",
    author: "Christus",
    countDown: 2,
    role: 0,
    category: "utility",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true    // Activation noprefix
  },

  onStart: async function ({ message, args }) {
    const cmds = global.GoatBot.commands;
    if (!cmds) return message.reply("⚠️ Command collection is not available.");

    // Afficher le détail d'une commande spécifique
    if (args.length) {
      const q = args[0].toLowerCase();
      const cmd = [...cmds.values()].find(
        c => c.config.name === q || (c.config.aliases && c.config.aliases.includes(q))
      );
      if (!cmd) return message.reply(`❌ No command called “${q}”.`);

      const i = cmd.config;
      const detail = `
╔═════════════════════════════
║ 🛠  Command Info
╠═════════════════════════════
║ 📌 Name      : ${i.name}
║ 🧩 Aliases   : ${i.aliases?.length ? i.aliases.join(", ") : "None"}
║ 👑 Access    : ${i.role === 2 ? "Admin Only" : i.role === 1 ? "VIP Only" : "All Users"}
║ 📂 Category  : ${i.category?.toUpperCase() || "NIX"}
║ ⚡ Prefix    : ${i.prefix === false ? "❌ Disabled" : "✅ Enabled"}
║ ✍️ Author    : ${i.author || "Unknown"}
║ 🆔 Version   : ${i.version || "N/A"}
╚═════════════════════════════
      `.trim();
      return message.reply(detail);
    }

    // Grouper les commandes par catégorie
    const cats = {};
    [...cmds.values()]
      .filter((c, i, s) => i === s.findIndex(x => x.config.name === c.config.name))
      .forEach(c => {
        const cat = c.config.category || "UNCATEGORIZED";
        if (!cats[cat]) cats[cat] = [];
        if (!cats[cat].includes(c.config.name)) cats[cat].push(c.config.name);
      });

    // Construire le message d'aide stylé
    let msg = "✨ 𝐆𝐨𝐚𝐭𝐁𝐨𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ✨\n\n";
    Object.keys(cats).sort().forEach(cat => {
      msg += `╭─🌟『 ${cat.toUpperCase()} 』🌟\n`;
      cats[cat].sort().forEach(n => {
        msg += `│ • ${n}\n`;
      });
      msg += `╰──────────────\n\n`;
    });

    msg += `
╔═════════════════════════════
║ 📊 Total commands : ${cmds.size}
║ ⚡ Powered by GoatBot
║ 👑 Developer : 𝐶𝐻𝑅𝐼𝑆𝑇𝑈𝑆
╚═════════════════════════════
「 𝗖𝗛𝗥𝗜𝗦𝗧𝗨𝗦 𝗕𝗢𝗧 」`;

    await message.reply(msg);
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
