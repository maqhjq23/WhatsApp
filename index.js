console.clear();
require("./setting/config");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
  downloadContentFromMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  jidDecode
} = require("@whiskeysockets/baileys");
const chalk = require("chalk");
const pino = require("pino");
const fs = require('fs');
const FileType = require("file-type");
const readline = require("readline");
const path = require("path");

const {
  smsg,
  isUrl,
  getBuffer,
  getSizeMedia,
  sleep
} = require("./System/System.js");

const usePairingCode = global.connect;

function question(text) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(text, resolve);
  });
}

async function followNewsletterWithDelay(sock, newsletterId, delay) {
  await sleep(delay);
  try {
    await sock.newsletterFollow(newsletterId);
    console.log(chalk.green(`berhasil follow channel: ${newsletterId}`));
  } catch (error) {
    console.log(chalk.red(`gagal follow ${newsletterId}: ${error.message}`));
  }
}

async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestWaWebVersion();
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    printQRInTerminal: !usePairingCode,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {}
              },
              ...message
            }
          }
        };
      }
      return message;
    },
    version: version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({
        level: "silent",
        stream: "store"
      }))
    }
  });

  if (!sock.authState.creds.registered) {
    console.log(chalk.blue("\nSELAMAT MENGGUNAKAN SCRIPT INI SILAHKAN MASUKAN NOMOR ANDA AWALI DENGAN 62XX"));
    const phoneNumber = await question(chalk.blue("Enter Your Number\nYour Number: "));
    const code = await sock.requestPairingCode(phoneNumber, "DANZZPROO");
    console.log(chalk.green("\nCode: " + code));
  }

  const store = makeInMemoryStore({
    logger: pino({ level: "silent" }).child({ stream: "store" })
  });
  store.bind(sock.ev);

  sock.ev.on("call", async () => {
    console.log("CALL OUTGOING");
  });

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
    } else {
      return jid;
    }
  };

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      let mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === "status@broadcast") return;
      if (!sock.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      
      let m = smsg(sock, mek, store);
      require("./TheDanzPro")(sock, m, chatUpdate, store);
    } catch (err) {
      console.error("Error processing message upsert:", err);
    }
  });

  sock.getFile = async (PATH, returnAsFilename) => {
    let res;
    let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], "base64") : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === "string" ? PATH : Buffer.alloc(0);
    const defaultType = { mime: "application/octet-stream", ext: ".bin" };
    let type = (await FileType.fromBuffer(data)) || defaultType;
    let filename = path.join(__dirname, "../" + new Date() * 1 + '.' + type.ext);
    if (data && returnAsFilename) {
      fs.promises.writeFile(filename, data);
    }
    return {
      res: res,
      filename: filename,
      size: await getSizeMedia(data),
      ...type,
      data: data
    };
  };

  sock.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  sock.sendText = (jid, text, quoted = '', options) => sock.sendMessage(jid, { text: text, ...options }, { quoted: quoted });

  sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? filename + '.' + type.ext : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  sock.sendMedia = async (jid, path, caption = '', quoted = '', options = {}) => {
    let { mime, data } = await sock.getFile(path, true);
    let messageType = mime.split('/')[0];
    let messageContent = {};
    if (messageType === "image") {
      messageContent = { image: data, caption: caption, ...options };
    } else if (messageType === "video") {
      messageContent = { video: data, caption: caption, ...options };
    } else if (messageType === "audio") {
      messageContent = { audio: data, ptt: options.ptt || false, ...options };
    } else {
      messageContent = { document: data, mimetype: mime, fileName: options.fileName || "file" };
    }
    await sock.sendMessage(jid, messageContent, { quoted });
  };

  sock.sendPoll = async (jid, name = '', values = []) => {
    const pollMessage = {
      pollCreationMessage: {
        name: name,
        options: values.map(val => ({ optionName: val })),
        selectableCount: 1
      }
    };
    await sock.sendMessage(jid, pollMessage);
  };

  sock.setStatus = async (status) => {
    const query = {
      to: "@s.whatsapp.net",
      type: "set",
      xmlns: "status"
    };
    await sock.query({
      tag: 'iq',
      attrs: query,
      content: [{
        tag: "status",
        attrs: {},
        content: Buffer.from(status, "utf-8")
      }]
    });
    console.log(chalk.yellow("Status updated: " + status));
  };

  sock.public = global.publicX;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log(chalk.green("Berhasil terhubung ke WhatsApp"));
      
      const channelIds = [
       "120363406319695948@newsletter",
       "120363429367878076@newsletter"  
      ];

      for (let i = 0; i < channelIds.length; i++) {
        if(channelIds[i].includes("@newsletter")) {
           followNewsletterWithDelay(sock, channelIds[i], 1500 * (i + 1));
        }
      }
    }
  });

  sock.ev.on("error", error => {
    console.error(chalk.red("Error: "), error.message || error);
  });

  sock.ev.on("creds.update", saveCreds);
}

connectToWhatsApp();
