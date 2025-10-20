const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "bal",
    aliases: ["wallet", "cash", "coins"],
    version: "1.3",
    author: "Christus",
    countDown: 3,
    role: 0,
    shortDescription: { en: "💎 Check your glowing wallet!" },
    longDescription: { en: "Display your balance in a glowing neon card with avatar, name, and amount." },
    category: "💼 Economy",
    guide: { en: "➤ +bal\n➤ +bal @user" },
    usePrefix: true,
    useChat: true,
  },

  onStart: async function({ event, args, message, usersData, api, role }) {
    let targetID = event.senderID;

    if (args.length > 0) {
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (/^\d{5,20}$/.test(args[0])) {
        if (role === 2) targetID = args[0];
        else return message.reply("🔒 Only bot owner can check others' wallets!");
      }
    }

    const name = await usersData.getName(targetID);
    const balance = (await usersData.get(targetID, "money")) || 0;

    try {
      let avatarURL = await usersData.getAvatarUrl(targetID);
      if (!avatarURL) avatarURL = "https://i.imgur.com/4NZ6uLY.jpg";

      const width = 450;
      const height = 200;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fonction pour générer une couleur aléatoire
      function randomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
      }

      // Fond noir uni
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Load avatar
      const avatarResp = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarImg = await loadImage(Buffer.from(avatarResp.data, "binary"));
      const avatarSize = 100;
      const avatarX = 20;
      const avatarY = (height - avatarSize) / 2;

      // Draw glowing avatar
      ctx.save();
      ctx.shadowColor = randomColor(); // glow color
      ctx.shadowBlur = 20; // glow intensity
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Draw glowing border around avatar
      ctx.shadowColor = randomColor();
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = randomColor();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw glowing user name
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = randomColor();
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillText(name, avatarX + avatarSize + 20, avatarY + 40);

      // Draw glowing balance
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = randomColor();
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillText(`Balance: ＄${balance.toLocaleString()}`, avatarX + avatarSize + 20, avatarY + 90);

      // Draw decorative glowing stars
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = randomColor();
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillText("★", x, y);
      }

      // Decorative glowing line
      ctx.shadowColor = randomColor();
      ctx.shadowBlur = 10;
      ctx.strokeStyle = randomColor();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(avatarX + avatarSize + 20, avatarY + 110);
      ctx.lineTo(width - 20, avatarY + 110);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Save image
      const imgBuffer = canvas.toBuffer("image/png");
      const imgPath = path.join(__dirname, "cache", `wallet_${targetID}.png`);
      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, imgBuffer);

      api.sendMessage(
        { body: "💎 Here's your glowing wallet card!", attachment: fs.createReadStream(imgPath) },
        event.threadID
      );
    } catch (err) {
      console.error("Wallet image generation error:", err);
    }
  },

  onChat: async function({ event, message }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    if (["bal", "wallet", "cash", "coins"].includes(body.trim())) {
      message.body = "+bal";
      return this.onStart({ ...arguments[0], args: [], message });
    } else if (body.startsWith("bal ")) {
      const args = body.trim().split(/\s+/).slice(1);
      message.body = "+bal " + args.join(" ");
      return this.onStart({ ...arguments[0], args, message });
    }
  },
};
