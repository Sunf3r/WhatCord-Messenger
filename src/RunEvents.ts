import Eris, { Attachment, FileContent, WebhookPayload } from "eris";
import { FixedSender } from "./Components/Typings/modules";
import { whatsApp, discord } from "./JSON/settings.json";
import { inspect } from "util";
import emojis from "./JSON/emojis.json";
import mime = require('mime-types');
import venom from "venom-bot";

export default module.exports = class Events {
    discord: Eris.Client;
    wpp: venom.Whatsapp;
    groupID: string;

    constructor(discord: Eris.Client, whatsapp: venom.Whatsapp) {
        this.discord = discord;
        this.wpp = whatsapp;
        this.groupID = whatsApp.GROUP_ID;
    }

    async DiscordMessageCreate(message: Eris.Message) {
        if (message.author.bot || message.channel.id !== discord.CHANNEL_ID) return;

        let msgContent = `*${message.author.username}*:\n${message.cleanContent}`,
            reply;

        if (message.referencedMessage)
            reply = (await this.wpp.getAllMessagesInChat(this.groupID, true, true))
                .filter(m => !!m.text).reverse()
                .find(msg =>
                    msg.text.startsWith('\u200b ')
                        ? msg.text.split('\n')[1] === message.referencedMessage?.content
                        : msg.text === message.referencedMessage?.content
                )

        if (message.content.toLowerCase().startsWith(".eval")) {
            let evaled: string = await eval(`${message.content.replace('.eval', '')}`);
            return message.channel.createMessage(`\`\`\`js\n${String(inspect(evaled)).slice(0, 1800)}\`\`\``);
        }

        this.sendMessage(this.groupID, msgContent, message.attachments[0], reply);
        return;
    }

    async WhatsAppMessageCreate(message: venom.Message) {
        let { id, chat, type, mimetype } = message as venom.Message,
            //@ts-ignore o objeto de Message#Sender está incompleto e errado
            // esse novo tipo vai substituir o tipo original
            sender = message.sender as FixedSender,
            text = String(message.text || '').slice(0, 1980),
            isMedia = type !== 'chat' || message.isMedia ? true : false,
            // o objeto quotedMsgObj é declarado com o tipo never
            // e por isso ele fica sem propriedades
            quotedMsgObj = message.quotedMsgObj ? message.quotedMsgObj as venom.Message : null,
            senderPfp = sender?.profilePicThumbObj?.imgFull || await this.wpp.getProfilePicFromServer(sender.id) || '',
            senderName = sender?.pushname || sender?.displayName || sender?.formattedName || "Nome desconhecido";

        if (text === 'getID')
            return console.info(`ID of "${chat.name}": "${chat.id}"`);

        if (chat.id != this.groupID || text.startsWith('\u200b ')) return;

        let msgObj: WebhookPayload = {
            content: !isMedia ? text || '```diff\n- Anexo```' : text,
            avatarURL: senderPfp,
            username: senderName,
            embeds: [],
            file: []
        };

        if (isMedia)
            msgObj.file = [{
                name: `anexo.${mime.extension(mimetype)}`,
                file: (await this.wpp.decryptFile(message))
            }];

        if (quotedMsgObj) {
            quotedMsgObj = (await this.wpp.getAllMessagesInChat(message.chat.id, true, true))
                .map(a => a).reverse()
                .find(msg => msg.body === quotedMsgObj?.body && msg.type === quotedMsgObj.type)!;

            if (!quotedMsgObj) return;

            let text = String(quotedMsgObj.text || '').slice(0, 1980),
                //@ts-ignore
                sender: FixedSender = quotedMsgObj.sender;

            let senderPfp = sender?.profilePicThumbObj?.imgFull || await this.wpp.getProfilePicFromServer(sender.id) || '',
                senderName = sender?.pushname || sender?.displayName || sender?.formattedName || "Nome desconhecido";

            msgObj.embeds = [{
                color: parseInt('53beea', 16),
                author: {
                    name: text.startsWith('\u200b ')
                        ? text.split('\n')[0]
                        : senderName,
                    icon_url: senderPfp
                },
                description: text.startsWith('\u200b ') ? text.split('\n')[1] : text
            }]

            if (quotedMsgObj.isMedia) {
                (msgObj.file as FileContent[]).push({
                    name: `anexo.${mime.extension(quotedMsgObj.mimetype)}`,
                    file: (await this.wpp.decryptFile(quotedMsgObj))
                });
                msgObj.embeds[0].thumbnail = { url: `attachment://anexo.${mime.extension(quotedMsgObj.mimetype)}`}
            }
        }

        // const reply = (body: string, template: 'warn' | 'correct' | 0, e: string = '') => {
        //     let title = body.split('|')[0],
        //         desc = body.split('|')[1];

        //     if (body.includes('|')) {
        //         let s = body.split('|')
        //         body = `${e} *${s[0]}* ${e}\n\n${s.slice(1).join(' ')}`
        //     }

        //     this.wpp.reply(chat.id, body, id);
        // }

        this.discord.executeWebhook(discord.WEBHOOK.ID, discord.WEBHOOK.TOKEN, msgObj);
        return;
    }

    async sendMessage(chatId: string, content: string, anexo?: Attachment, reply?: venom.Message) {
        content = `\u200b ${content}`;

        if (anexo)
            return await this.wpp
                .sendFile(chatId, anexo.proxy_url, anexo.filename, content);


        if (reply)
            return await this.wpp.reply(chatId, content, reply.id);

        return this.wpp.sendText(chatId, content);
    }
}