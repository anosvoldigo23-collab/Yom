const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "apitest",
    aliases: ["api", "apicall"],
    version: "1.0",
    author: "Christus",
    countDown: 10,
    role: 0,
    description: "Teste un endpoint API donné avec différentes méthodes HTTP et données.",
    category: "utilitaire",
    guide: "{pn} <méthode> <url> [headers] [body]",
    noPrefix: true // Activation noprefix
  },

  onStart: async function ({ api, event, args }) {
    const w = await api.sendMessage("🔎 Test de l'API en cours...", event.threadID);

    const [method, url, headersString, bodyString] = args;

    if (!method || !url) {
      return api.sendMessage(this.config.guide, event.threadID, event.messageID);
    }

    const httpMethod = method.toUpperCase();
    let requestHeaders = {};
    let requestBody = {};

    if (headersString) {
      try {
        requestHeaders = JSON.parse(headersString);
      } catch (e) {
        return api.sendMessage("❌ Headers invalides. Utilisez un JSON valide.", event.threadID);
      }
    }

    if (bodyString) {
      try {
        requestBody = JSON.parse(bodyString);
      } catch (e) {
        return api.sendMessage("❌ Corps de requête invalide. Utilisez un JSON valide.", event.threadID);
      }
    }

    try {
      let response;
      const config = { headers: requestHeaders };

      switch (httpMethod) {
        case "GET":
          response = await axios.get(url, config);
          break;
        case "POST":
          response = await axios.post(url, requestBody, config);
          break;
        case "PUT":
          response = await axios.put(url, requestBody, config);
          break;
        case "DELETE":
          response = await axios.delete(url, { ...config, data: requestBody });
          break;
        default:
          return api.sendMessage("❌ Méthode HTTP invalide. Supportées : GET, POST, PUT, DELETE.", event.threadID);
      }

      const responseBody = JSON.stringify(response.data, null, 2);
      const statusCode = response.status;
      const statusText = response.statusText;

      const replyMessage = `✅ Résultat du test API\n\n` +
                           `URL : ${url}\n` +
                           `Méthode : ${httpMethod}\n` +
                           `Code statut : ${statusCode} ${statusText}\n\n` +
                           `Corps de la réponse :\n` +
                           `\`\`\`json\n${responseBody}\n\`\`\``;

      await api.sendMessage(replyMessage, event.threadID, event.messageID);
      await api.unsendMessage(w.messageID);

    } catch (e) {
      const errorMessage = e.response ? `Statut : ${e.response.status}\nMessage : ${e.response.statusText}` : e.message;
      api.sendMessage(`❌ La requête API a échoué.\n\nErreur : ${errorMessage}`, event.threadID);
    }
  }
};

// Active le mode noprefix via GoatWrapper
const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: false });
