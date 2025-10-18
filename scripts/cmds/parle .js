const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Modèles de voix disponibles
const models = {
  "1": { name: "Joey", desc: "🧑 Voix masculine (Anglais américain)" },
  "2": { name: "Amy", desc: "👩 Voix féminine (Anglais britannique)" },
  "3": { name: "Brian", desc: "🧔‍♂️ Voix masculine (Anglais britannique)" },
  "4": { name: "Mizuki", desc: "👧 Voix féminine (Japonais)" }
};

module.exports = {
  config: {
    name: "parle",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "média",
    shortDescription: "🗣️ Convertir du texte en parole avec différentes voix",
    longDescription: "Génère un fichier audio depuis un texte en utilisant plusieurs modèles de voix prédéfinis (aucune clé API requise)",
    guide: `
+parle Bonjour tout le monde
+parle Salut à tous -m2
+parle -m (pour voir la liste des voix)
    `.trim(),
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args }) {
    const input = args.join(" ");
    if (!input) return message.reply("❗ Merci de fournir un texte. Exemple : `+parle Bonjour tout le monde`");

    // Afficher la liste des voix
    if (input.toLowerCase() === "-m") {
      const listVoices = Object.entries(models).map(([num, m]) => `🔢 -m${num} : ${m.name}\n${m.desc}`).join("\n\n");
      const listMsg = `
🎤 𝗟𝗶𝘀𝘁𝗲 𝗱𝗲𝘀 𝘃𝗼𝗶𝘅 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀 :

${listVoices}

📝 Utilisation : +parle Salut à tous -m2
      `.trim();
      return message.reply(listMsg);
    }

    // Extraire le modèle choisi
    const modelMatch = input.match(/-m(\d+)/);
    const modelNum = modelMatch ? modelMatch[1] : "1";
    const voice = models[modelNum]?.name;
    if (!voice) return message.reply("❌ Numéro de modèle invalide. Utilise `+parle -m` pour voir la liste.");

    // Nettoyer le texte
    const content = input.replace(`-m${modelNum}`, "").trim();
    if (!content) return message.reply("❗ Le texte est vide après avoir retiré le flag du modèle.");

    try {
      // Requête TTSMP3 pour générer l'audio
      const res = await axios.post("https://ttsmp3.com/makemp3_new.php", new URLSearchParams({
        msg: content,
        lang: voice,
        source: "ttsmp3"
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      if (!res.data || !res.data.URL) return message.reply("⚠️ Échec de la génération audio.");

      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, "cache", fileName);
      await fs.ensureDir(path.dirname(filePath));

      const audioRes = await axios.get(res.data.URL, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      audioRes.data.pipe(writer);

      writer.on("finish", () => {
        const msg = `
╔═════════════════════════════
║ 🗣️ 𝐓𝐞𝐱𝐭𝐞 : ${content}
║ 🎤 𝐕𝐨𝐢𝐱 : ${voice}
╚═════════════════════════════
        `.trim();
        message.reply({ body: msg, attachment: fs.createReadStream(filePath) });
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue lors de la génération vocale.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
