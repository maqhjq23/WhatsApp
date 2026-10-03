console.clear();
require("./setting/config");

const {
  default: baileys,
  downloadContentFromMessage,
  proto,
  generateWAMessage,
  getContentType,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  GroupSettingChange,
  WAGroupMetadata,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  WAGroupInviteMessageGroupMetadata,
  GroupMetadata,
  Headers,
  WA_DEFAULT_EPHEMERAL,
  getAggregateVotesInPollMessage,
  generateWAMessageContent,
  areJidsSameUser,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeWaSocket,
  makeInMemoryStore,
  MediaType,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  initInMemoryKeyStore,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WAMediaUpload,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  templateMessage,
  InteractiveMessage,
  Header
} = require("@whiskeysockets/baileys");

const fs = require('fs');
const path = require("path");
const util = require("util");
const chalk = require("chalk");
const crypto = require("crypto");
const moment = require("moment-timezone");
const { spawn, exec, execSync } = require("child_process");

module.exports = Ril = async (sock, m, chatUpdate, store) => {
  try {
    var body = m.mtype === "conversation" ? m.message.conversation || "[Conversation]" 
      : m.mtype === "imageMessage" ? m.message.imageMessage.caption || "[Image]" 
      : m.mtype === "videoMessage" ? m.message.videoMessage.caption || "[Video]" 
      : m.mtype === "audioMessage" ? m.message.audioMessage.caption || "[Audio]" 
      : m.mtype === "stickerMessage" ? m.message.stickerMessage.caption || "[Sticker]" 
      : m.mtype === "documentMessage" ? m.message.documentMessage.fileName || "[Document]" 
      : m.mtype === "contactMessage" ? "[Contact]" 
      : m.mtype === "locationMessage" ? m.message.locationMessage.name || "[Location]" 
      : m.mtype === "liveLocationMessage" ? "[Live Location]" 
      : m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text || "[Extended Text]" 
      : m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId || "[Button Response]" 
      : m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId || "[List Response]" 
      : m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId || "[Template Button Reply]" 
      : m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson)?.['id'] || "[Interactive Response]" 
      : m.mtype === "pollCreationMessage" ? "[Poll Creation]" 
      : m.mtype === "reactionMessage" ? m.message.reactionMessage.text || "[Reaction]" 
      : m.mtype === "ephemeralMessage" ? "[Ephemeral]" 
      : m.mtype === "viewOnceMessage" ? "[View Once]" 
      : m.mtype === "productMessage" ? m.message.productMessage.product?.["name"] || "[Product]" 
      : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.["selectedButtonId"] || m.message.listResponseMessage?.["singleSelectReply"]["selectedRowId"] || m.text || "[Message Context]" 
      : "[Unknown Type]";

    var budy = typeof m.text == "string" ? m.text : '';
    var prefix = global.prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : '' : global.prefa ?? global.prefix;

    const {
      smsg, tanggal, getTime, isUrl, sleep, clockString, runtime, fetchJson, getBuffer, jsonformat, format, parseMention, getRandom, getGroupAdm, generateProfilePicture
    } = require("./System/System");

    const command = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const botNumber = await sock.decodeJid(sock.user.id);
    
    const formatNumber = (jid) => {
      if (!jid) return '';
      const num = String(jid).trim();
      if (!num) return '';
      const extracted = num.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      return extracted ? extracted + "@s.whatsapp.net" : '';
    };

  const convertAudioToVoiceNote = async (audioPath) => {
  return new Promise((resolve) => {
    const outputPath = path.join(__dirname, "temp_vn_" + Date.now() + ".ogg");
    exec(`ffmpeg -i "${audioPath}" -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 60 -application voip "${outputPath}" -y`, (err) => {
      if (err) {
        console.error("gagal convert audio ke vn:", err);
        resolve(null);
      } else {
        const buffer = fs.readFileSync(outputPath);
        fs.unlinkSync(outputPath); 
        resolve(buffer);
      }
    });
  });
};
    const sender = formatNumber(m.sender || m.key?.participant || m.participant || m.key?.remoteJid);
    const q = args.join(" ");
    const from = chatUpdate.messages[0].key.remoteJid;
    
    const groupMetadata = m.isGroup ? await sock.groupMetadata(from).catch(() => {}) : '';
    const groupName = m.isGroup ? groupMetadata.subject : '';
    const pushname = m.pushName || "No Name";
    const timeNow = moment().tz("Asia/Jakarta").format("HH:mm:ss");

    let ucapanWaktu;
    if (timeNow >= "19:00:00" && timeNow < "23:59:00") ucapanWaktu = "Selamat Malam";
    else if (timeNow >= "15:00:00" && timeNow < "19:00:00") ucapanWaktu = "Selamat Sore";
    else if (timeNow >= "11:00:00" && timeNow < "15:00:00") ucapanWaktu = "Selamat Siang";
    else if (timeNow >= "06:00:00" && timeNow < "11:00:00") ucapanWaktu = "Selamat Pagi";
    else ucapanWaktu = "Selamat Subuh";
    m.ucapanWaktu = ucapanWaktu;

    const dateNow = new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta", year: "numeric", month: "long", day: "numeric"
    });
    
    const thumbFile = fs.readFileSync("./System/Profile/Thumb.jpg");

    if (!sock.public) return;

    if (command) {
      if (m.isGroup) {
        console.log(chalk.bgBlue.white.bold("# New Message"));
        console.log(chalk.bgHex("#f39c12").hex("#ffffff").bold(` 📅 Date : ${dateNow} 
 🕐 Time : ${timeNow} 
 💬 Message Received : ${m.mtype} 
 🌐 Group Name : ${groupName} 
 🔑 Group Id : ${m.chat} 
 🗣️ Sender : ${pushname} 
 👤 Recipient : ${botNumber} 
`));
      } else {
        console.log(chalk.bgBlue.white.bold("━━━━ ⌜ SYSTEM - PRIVATE ⌟ ━━━━"));
        console.log(chalk.bgHex("#f39c12").hex("#ffffff").bold(` 📅 Date : ${dateNow} 
 🕐 Time : ${timeNow} 
 💬 Message Received : ${m.mtype} 
 🌐 Group Name : No In Group 
 🔑 Group Id : No In Group 
 🗣️ Sender : ${pushname} 
 👤 Recipient : ${botNumber} 
`));
      }
    }


    const fakeKey = { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" };
    const fakeOrder = {
      orderId: "2029",
      thumbnail: thumbFile,
      itemCount: "999999999 ",
      status: "INQUIRY",
      surface: "CATALOG",
      message: "TheDanzPro",
      token: "AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA=="
    };
    const fakeMessage = { orderMessage: fakeOrder };
    const fakeContext = { mentionedJid: [m.sender], forwardingScore: 999, isForwarded: true };
    const fakeQuote = { key: fakeKey, message: fakeMessage, contextInfo: fakeContext };

    const reply = async (text, extra = {}) => {
      await sock.sendPresenceUpdate("composing", m.chat); // 🟢 mengetik...
      await sleep(1000);                                  // ⏱️ delay 1 detik
      await sock.sendMessage(m.chat, { text, ...extra }, { quoted: m }); // 📨 kirim
      await sock.sendPresenceUpdate("paused", m.chat);    // ⚪ berhenti mengetik
    };

// COMMAND MENU


    switch (command) {
        case "menu": {
        // 1. Munculkan status mengetik (composing)
        await sock.sendPresenceUpdate("composing", m.chat);
        
        const reacts = ['🙂‍↕️', '🫨', '🗿'];
        for (const react of reacts) {
          await sock.sendMessage(m.chat, { react: { text: react, key: m.key } });
          await sleep(300);
        }
        
        const media = await prepareWAMessageMedia({
          video: { url: "./System/Profile/menu.mp4" },
          gifPlayback: true,
          jpegThumbnail: fs.readFileSync("./System/Profile/menu-thumbnail.jpg")
        }, { upload: sock.waUploadToServer });

        const menuText = `*${m.ucapanWaktu}* ${m.pushName} 🖕
*saya ${global.botName} Bot, yang siap membantu kamu dengan fitur yang tersedia !*

\`[ INFORMASI BOT ]\`

> • *BotName* : ${global.botName}
> • *Developer* : ${global.dev}
> • *Action* : ẉ.dev/TheDanzPro
`;
        
        const interactiveMsg = proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "`© Copyright by " + global.dev + "`" }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                  title: '',
                  hasMediaAttachment: true,
                  videoMessage: media.videoMessage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: "Version 1.0.0",
                      url: global.telegram,
                      copy_code: global.dev,
                      expiration_time: Date.now() * 1000
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Button Menu",
                      button_title: "Button Menu"
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: global.telegram,
                      domain: global.webstore,
                      button_index: 0
                    }
                  }),
                  buttons: [{
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                  }, {
                    name: "call_permission_request",
                    buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                  }, {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "Menu Bot",
                      sections: [{
                        title: "Menu Bot",
                        highlight_label: "recommend",
                        rows: [
                        { title: "Game Menu",    description: "Menu Game Hiburan",         id: 'gamemenu' }
 
                      ]
                      }],
                      has_multiple_buttons: true
                    })
                  }, {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "Saluran Developer",
                      url: global.saluran,
                      merchant_url: global.saluran
                    })
                  }]
                })
              })
            }
          }
        });

        const msgContent = generateWAMessageFromContent(m.chat, interactiveMsg, { userJid: sock.user.id, quoted: fakeQuote });
        
        // Beri sedikit jeda agar efek mengetiknya terasa (misal 1 detik)
        await sleep(1000);

        await sock.relayMessage(m.chat, msgContent.message, { messageId: msgContent.key.id });

        // 2. Matikan status mengetik (paused) setelah pesan terkirim
        await sock.sendPresenceUpdate("paused", m.chat);

        await sleep(1000);
        break;
      }

      case "gamemenu": {
        // 1. Munculkan status mengetik (composing)
        await sock.sendPresenceUpdate("composing", m.chat);

        const reacts = ['🙂‍↕️', '🫨', '🗿'];
        for (const react of reacts) {
          await sock.sendMessage(m.chat, { react: { text: react, key: m.key } });
          await sleep(300);
        }

        const media = await prepareWAMessageMedia({
          video: { url: "./System/Profile/menu.mp4" },
          gifPlayback: true,
          jpegThumbnail: fs.readFileSync("./System/Profile/menu-thumbnail.jpg")
        }, { upload: sock.waUploadToServer });

        const menuText = `*${m.ucapanWaktu}* ${m.pushName} 🖕
*saya ${global.botName}, yang siap membantu kamu dengan fitur yang tersedia !*

\`[ INFORMASI BOT ]\`

> • *BotName* : ${global.botName}
> • *Developer* : ${global.dev}
> • *Action* : ẉ.dev/TheDanzPro

\`[ GAME MENU]\`

> • *.GameDino*
`;

        const interactiveMsg = proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "`© Copyright by " + global.dev + "`" }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                  title: '',
                  hasMediaAttachment: true,
                  videoMessage: media.videoMessage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: [
                    // 1. Tombol Menu Utama (Tampil di atas)
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "Menu Utama",
                        id: ".menu"
                      })
                    },
                    // 2. Tombol Saluran Developer (Tampil di bawahnya)
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "Saluran Developer",
                        url: global.saluran,
                        merchant_url: global.saluran
                      })
                    }
                  ]
                })
              })
            }
          }
        });

        const msgContent = generateWAMessageFromContent(m.chat, interactiveMsg, { userJid: sock.user.id, quoted: fakeQuote });
        
        // Jeda sebentar agar efek mengetik terlihat
        await sleep(1000);

        await sock.relayMessage(m.chat, msgContent.message, { messageId: msgContent.key.id });
        
        // 2. Matikan status mengetik (paused) setelah pesan terkirim
        await sock.sendPresenceUpdate("paused", m.chat);

        await sleep(1000);
        break;
      }



    }
  } catch (err) {
    sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    console.log(chalk.red(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.green(`${__filename} updated!`));
  delete require.cache[file];
  require(file);
});