const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "fbcover",
    version: "0.2.0",
    author: "Christus",
    role: 0,
    shortDescription: { fr: "Générer une couverture Facebook personnalisée" },
    longDescription: { fr: "Crée une couverture Facebook en utilisant vos informations et couleurs." },
    category: "image",
    guide: { fr: "{pn} Nom | Prénom | Email | Téléphone | Adresse | Couleur" },
    noPrefix: true
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length < 6) {
      return message.reply(
        "❌ Veuillez fournir tous les champs requis :\nNom | Prénom | Email | Téléphone | Adresse | Couleur"
      );
    }

    const [name, subname, email, phoneNumber, address, color] = input;
    const uid = event.senderID;

    const waitMsg = await message.reply("🖼 Génération de votre couverture Facebook, veuillez patienter...");

    try {
      // Génération du texte en gras
      const boldApi = "http://65.109.80.126:20409/aryan/font?style=bold";
      const [boldName, boldEmail, boldPhone, boldAddress, boldColor] = await Promise.all([
        axios.get(`${boldApi}&text=${encodeURIComponent(name)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(email)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(phoneNumber)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(address)}`),
        axios.get(`${boldApi}&text=${encodeURIComponent(color)}`)
      ]);

      // Appel API pour générer l'image
      const apiUrl = `http://65.109.80.126:20409/aryan/fbcover?name=${encodeURIComponent(name)}&uid=${uid}&subname=${encodeURIComponent(subname)}&email=${encodeURIComponent(email)}&phoneNumber=${encodeURIComponent(phoneNumber)}&address=${encodeURIComponent(address)}&color=${encodeURIComponent(color)}`;
      const imgBuffer = (await axios.get(apiUrl, { responseType: "arraybuffer" })).data;

      // Sauvegarde temporaire
      const fileName = `fbcover-${Date.now()}.png`;
      const filePath = path.join(__dirname, "cache", fileName);
      await fs.outputFile(filePath, Buffer.from(imgBuffer));

      // Envoi du résultat
      await message.reply({
        body:
`✅ Couverture Facebook créée !

👤 Nom : ${boldName.data.result}
📧 Email : ${boldEmail.data.result}
📱 Téléphone : ${boldPhone.data.result}
📍 Adresse : ${boldAddress.data.result}
🎨 Couleur : ${boldColor.data.result}`,
        attachment: fs.createReadStream(filePath)
      });

      // Nettoyage
      await fs.remove(filePath);
      if (waitMsg) await message.unsend(waitMsg.messageID);

    } catch (err) {
      console.error("Erreur fbcover :", err);
      if (waitMsg) await message.unsend(waitMsg.messageID);
      message.reply("❌ Une erreur est survenue lors de la génération de la couverture. Veuillez réessayer plus tard.");
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
