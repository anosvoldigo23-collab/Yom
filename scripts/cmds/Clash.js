const axios = require('axios');

const API_URL = 'https://messie-flash-api-ia.vercel.app/chat?prompt=';
const API_KEY = 'messie12356osango2025jinWoo';

const activeClashes = new Map();
const clashHistories = new Map();

async function generateClash(input, userId, adversaireNom) {
    const cleanInput = input.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const history = clashHistories.get(userId) || [];
    const lastMessages = history.slice(-3).join(" | ");

    const prompt = `
[SYSTEM] MODE BATTLE CLASH PRO
Tu es un bot de clash ultra-agressif.
RÈGLES :
- Mentionne toujours l'adversaire : ${adversaireNom}.
- Réponses uniques, brutales, 20-50 mots si possible.
- Aucune répétition, style percutant et créatif.
Derniers messages : ${lastMessages}
[${adversaireNom}]: ${cleanInput}
`;

    try {
        const res = await axios.get(`${API_URL}${encodeURIComponent(prompt)}&apiKey=${API_KEY}`, { timeout: 10000 });
        const result = res.data?.parts?.[0]?.reponse || res.data?.response;
        if (!result) return "⚠️ Impossible de générer un clash.";

        const words = result.trim().split(/\s+/);
        // On supprime la limite minimale : le bot répond toujours
        if (words.length > 50) return words.slice(0, 50).join(' ');

        history.push(cleanInput, result.trim());
        clashHistories.set(userId, history);

        return result.trim();
    } catch {
        return "❌ Impossible de se connecter à l'IA.";
    }
}

module.exports = {
    config: {
        name: 'clash',
        author: 'Christus',
        version: '5.1',
        role: 0,
        category: 'Fun',
        shortDescription: '💥 Duel verbal extrême',
        longDescription: 'Bataille de clash ultra-violente avec mémoire et réponses automatiques',
    },

    onStart: async function ({ api, event, args }) {
        const admin = global.GoatBot.config.adminBot.includes(event.senderID);
        if (!admin) return api.sendMessage("❌ Commande réservée aux administrateurs", event.threadID);

        const action = args[0]?.toLowerCase();
        const targetID = event.messageReply?.senderID || args[1] || event.senderID;

        if (action === 'on') {
            if (activeClashes.has(targetID)) return api.sendMessage("⚔️ Une bataille est déjà en cours !", event.threadID);
            activeClashes.set(targetID, { threadID: event.threadID });
            clashHistories.set(targetID, []);

            try {
                const user = await api.getUserInfo(targetID);
                const name = user?.[targetID]?.name || "Inconnu";
                return api.sendMessage(
`╔════════════════════╗
💥 𝗖𝗟𝗔𝗦𝗛 𝗕𝗔𝗧𝗧𝗟𝗘 💥
╚════════════════════╝

🔥 @${name}, tu es maintenant la cible du duel !
💀 Prépare-toi à encaisser des coups de mots impitoyables !
🛡️ Montre ton courage et ton esprit de combattant !

╔════════════════════╗
💥 La bataille commence ! 💥
╚════════════════════╝`, 
                event.threadID, event.messageID);
            } catch {
                return api.sendMessage(`Clash Battle lancé pour ${targetID}`, event.threadID);
            }

        } else if (action === 'off') {
            if (!activeClashes.has(targetID)) return api.sendMessage("⚔️ Aucune bataille en cours !", event.threadID);
            activeClashes.delete(targetID);
            clashHistories.delete(targetID);
            return api.sendMessage(
`╔════════════════════╗
✅ BATTLE TERMINÉE ✅
╚════════════════════╝

🎉 Tu as survécu… pour l'instant !
💬 Reviens plus fort pour le prochain duel !
`, event.threadID);

        } else {
            return api.sendMessage("Usage: !clash on [@user] / !clash off [@user]", event.threadID);
        }
    },

    onChat: async function ({ api, event }) {
        if (!activeClashes.has(event.senderID)) return;
        if (!event.body || event.body.startsWith('!') || event.body.startsWith('/') || event.body.startsWith('.')) return;

        try {
            const user = await api.getUserInfo(event.senderID);
            const adversaireNom = user?.[event.senderID]?.name || "Inconnu";

            const aiResponse = await generateClash(event.body, event.senderID, adversaireNom);
            return api.sendMessage({
                body: `⚔️ 𝗖𝗟𝗔𝗦𝗛 💬\n@${adversaireNom} : ${aiResponse}`,
                mentions: [{ tag: `@${adversaireNom}`, id: event.senderID }]
            }, event.threadID, event.messageID);
        } catch {}
    }
};
