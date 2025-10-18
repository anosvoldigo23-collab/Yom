const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

// Définition des modèles vocaux disponibles
const models = {
  "1": { name: "Joey", desc: "🧑 Voix masculine (anglais américain)" },
  "2": { name: "Amy", desc: "👩 Voix féminine (anglais britannique)" },
  "3": { name: "Brian", desc: "🧔‍♂️ Voix masculine (anglais britannique)" },
  "4": { name: "Mizuki", desc: "👧 Voix féminine (japonais)" }
};

module.exports = {
  config: {
    name: "speak",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "media",
    shortDescription: "🗣️ Transforme du texte en parole",
    longDescription: "Génère de la parole à partir d'un texte avec différents modèles vocaux (sans clé API).",
    guide: "{pn} Bonjour -m2 → génère la voix Amy\n{pn} -m → liste des modèles vocaux",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, args, event }) {
    const input = args.join(" ");
    if (!input) return message.reply("❗ Veuillez fournir du texte. Exemple : `+speak Bonjour`");

    // Affiche la liste des modèles si "-m" est entré
    if (input.toLowerCase() === "-m") {
      const listMsg = `
🎤 𝗠𝗼𝗱𝗲̀𝗹𝗲𝘀 𝗧𝗧𝗦 𝗗𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:

🔢 -m1: Joey 
🧑 Voix masculine (anglais américain)

🔢 -m2: Amy 
👩 Voix féminine (anglais britannique)

🔢 -m3: Brian 
🧔‍♂️ Voix masculine (anglais britannique)

🔢 -m4: Mizuki 
👧 Voix féminine (japonais)

📝 Utilisation: +speak Bonjour -m2
      `.trim();
      return message.reply(listMsg);
    }

    // Sélection du modèle
    const modelMatch = input.match(/-m(\d+)/);
    const modelNum = modelMatch ? modelMatch[1] : "1";
    const voice = models[modelNum]?.name;
    if (!voice) return message.reply("❌ Numéro de modèle invalide. Tapez `+speak -m` pour la liste.");

    const content = input.replace(`-m${modelNum}`, "").trim();
    if (!content) return message.reply("❗ Le texte est vide après suppression du modèle.");

    try {
      const res = await axios.post(
        "https://ttsmp3.com/makemp3_new.php",
        new URLSearchParams({ msg: content, lang: voice, source: "ttsmp3" }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (!res.data || !res.data.URL) return message.reply("⚠️ Échec de la génération audio.");

      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, "cache", fileName);

      const audioRes = await axios.get(res.data.URL, { responseType: "stream" });
      await fs.ensureDir(path.dirname(filePath));
      const writer = fs.createWriteStream(filePath);

      audioRes.data.pipe(writer);
      writer.on("finish", () => {
        message.reply({
          body: `┌─🗣️ 𝗧𝗧𝗦 ─────────────┐\nTexte : ${content}\n🎤 Voix : ${voice}\n└─────────────────────┘`,
          attachment: fs.createReadStream(filePath)
        });
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur s'est produite lors de la génération de la parole.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
