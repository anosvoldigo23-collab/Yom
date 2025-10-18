const { resolve } = require("path");
const { existsSync, mkdirSync } = require("fs-extra");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "ship",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘",
    shortDescription: "💘 Crée un 'ship' entre deux utilisateurs avec image",
    usePrefix: false,
    noPrefix: true
  },

  onLoad: async function() {
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + "/cache/canvas/";
    const pathImg = resolve(__dirname, "cache/canvas", "pairing.jpg");

    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(pathImg)) await downloadFile("https://i.pinimg.com/736x/15/fa/9d/15fa9d71cdd07486bb6f728dae2fb264.jpg", pathImg);
  },

  makeImage: async function({ one, two }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const jimp = require("jimp");
    const __root = path.resolve(__dirname, "cache", "canvas");

    let pairing_img = await jimp.read(__root + "/pairing.jpg");
    let pathImg = __root + `/pairing_${one}_${two}.png`;
    let avatarOne = __root + `/avLt_${one}.png`;
    let avatarTwo = __root + `/avLt_${two}.png`;

    // Téléchargement des avatars
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    let circleOne = await jimp.read(await this.circle(avatarOne));
    let circleTwo = await jimp.read(await this.circle(avatarTwo));
    pairing_img.composite(circleOne.resize(85, 85), 355, 100).composite(circleTwo.resize(75, 75), 250, 140);

    let raw = await pairing_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
  },

  circle: async function(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  onStart: async function({ api, event }) {
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;
    const tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const tle = tl[Math.floor(Math.random() * tl.length)];

    let dataa = await api.getUserInfo(senderID);
    let namee = dataa[senderID].name;

    let loz = await api.getThreadInfo(threadID);
    let emoji = loz.participantIDs;
    let id = emoji[Math.floor(Math.random() * emoji.length)];

    let data = await api.getUserInfo(id);
    let name = data[id].name;

    const arraytag = [
      { id: senderID, tag: namee },
      { id: id, tag: name }
    ];

    const sex = data[id].gender;
    const gender = sex == 2 ? "Male🧑" : sex == 1 ? "Female👩‍" : "Tran Duc Bo";
    const one = senderID, two = id;

    return this.makeImage({ one, two }).then(async pathImg => {
      const message = {
        body: `💘${namee} fait un couple avec ${name} ${gender}💘\n\nTag : ${arraytag.map(tag => `@${tag.tag} `).join("")}`,
        mentions: arraytag,
        attachment: fs.createReadStream(pathImg),
      };

      api.sendMessage(message, threadID, async () => {
        try { fs.unlinkSync(pathImg); } catch (e) { console.log(e); }
      }, messageID);
      return;
    }).catch(e => console.log(e));
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
