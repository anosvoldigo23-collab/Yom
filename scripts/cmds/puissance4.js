const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "puissance4",
    aliases: ["4enligne", "p4"],
    version: "2.2",
    author: "Christus",
    countDown: 30,
    role: 0,
    category: "🎯 JEUX",
    shortDescription: "🟡🔴 Puissance 4 Joueur vs IA / Joueur vs Joueur",
    longDescription: "Jeu classique de connexion à 4 avec plateau visuel et IA intelligente",
    guide: "{pn} [mise] (optionnel @joueur pour PvP)",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, args, usersData, message }) {
    const miseMin = 100;
    const mise = parseInt(args[0]);
    const mentions = Object.keys(event.mentions);

    if (!mise || mise < miseMin) 
      return api.sendMessage(`🌀 Mise invalide\n💸 Minimum : ${miseMin}\n🔹 Usage : puissance4 [mise] @joueur`, event.threadID, event.messageID);

    const joueur1 = event.senderID;
    let joueur2, typeJeu;

    if (mentions.length === 0) { typeJeu = "pve"; joueur2 = "bot"; }
    else if (mentions.length === 1) { typeJeu = "pvp"; joueur2 = mentions[0]; 
      if (joueur1 === joueur2) return api.sendMessage("❌ Impossible de jouer contre vous-même !", event.threadID, event.messageID);
    } else return api.sendMessage("⚠️ Entrée invalide\n🔹 IA : puissance4 [mise]\n🔹 PvP : puissance4 [mise] @joueur", event.threadID, event.messageID);

    const [dataJ1, dataJ2] = await Promise.all([
      usersData.get(joueur1),
      typeJeu === "pvp" ? usersData.get(joueur2) : Promise.resolve({ money: Infinity })
    ]);

    if (dataJ1.money < mise) return api.sendMessage(`💸 Fonds insuffisants : ${dataJ1.money} pièces`, event.threadID, event.messageID);
    if (typeJeu === "pvp" && dataJ2.money < mise) return api.sendMessage(`💸 Fonds adversaire insuffisants`, event.threadID, event.messageID);

    await usersData.set(joueur1, { money: dataJ1.money - mise });
    if (typeJeu === "pvp") await usersData.set(joueur2, { money: dataJ2.money - mise });

    const plateau = Array(6).fill().map(() => Array(6).fill(0));
    const etatJeu = { joueurs: [joueur1, joueur2], joueurActuel: 0, plateau, mise, typeJeu, messageID: null };

    const texteAffichage = typeJeu === "pve" ? `🤖 Joueur vs Bot\n💰 Mise : ${mise}` : `👥 Joueur vs Joueur\n💰 Pot : ${mise*2}`;
    const msg = await api.sendMessage(`🎮 PUISSANCE 4 🎮\n━━━━━━━━━━━━\n${texteAffichage}\n\n${this.getBoardDisplay(plateau)}\n\n🔹 Tour actuel : Joueur 1\n💬 Répondez avec une colonne (1-6)`, event.threadID);

    etatJeu.messageID = msg.messageID;
    global.connect4Games = global.connect4Games || {};
    global.connect4Games[msg.messageID] = etatJeu;
  },

  // Fonctions utilitaires
  makeMove(board, col, player) {
    if (col < 0 || col > 5 || board[0][col] !== 0) return -1;
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === 0) { board[row][col] = player; return row; }
    }
    return -1;
  },

  getBotMove(board) {
    for (let col = 0; col < 6; col++) {
      const test = JSON.parse(JSON.stringify(board));
      if (this.makeMove(test, col, 2) !== -1 && this.checkWin(test, test.findIndex(r=>r.includes(2)), col)) return col;
    }
    for (let col = 0; col < 6; col++) {
      const test = JSON.parse(JSON.stringify(board));
      if (this.makeMove(test, col, 1) !== -1 && this.checkWin(test, test.findIndex(r=>r.includes(1)), col)) return col;
    }
    if (board[5][3] === 0) return 3;
    const valid = board[0].map((c,i)=>c===0?i:null).filter(c=>c!==null);
    return valid[Math.floor(Math.random()*valid.length)];
  },

  checkWin(board, row, col) {
    const p = board[row][col];
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    return dirs.some(([dx,dy])=>{
      let count=1;
      for(let i=1;i<4;i++){const r=row+i*dx,c=col+i*dy;if(r<0||r>=6||c<0||c>=6||board[r][c]!==p)break;count++;}
      for(let i=1;i<4;i++){const r=row-i*dx,c=col-i*dy;if(r<0||r>=6||c<0||c>=6||board[r][c]!==p)break;count++;}
      return count>=4;
    });
  },

  isBoardFull(board) { return board[0].every(cell => cell !== 0); },

  getBoardDisplay(board) {
    const symbols = ['⬜','🔴','🟡'];
    return '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣\n' + board.map(row => row.map(c=>symbols[c]).join('')).join('\n');
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
