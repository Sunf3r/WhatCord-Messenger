import Eris, { Attachment, Collection, WebhookPayload } from "eris";
import { FixedSender } from "./Components/Typings/modules";
import { whatsApp, discord } from "./JSON/settings.json";
import { inspect } from "util";
import mime = require('mime-types');
import venom from "venom-bot";
import axios from "axios";
import fs from "fs";

export default module.exports = class Events {
    discord: Eris.Client;
    wpp: venom.Whatsapp;
    groupID: string;
    msgs: Collection<venom.Message>;

    constructor(discord: Eris.Client, whatsapp: venom.Whatsapp) {
        this.discord = discord;
        this.wpp = whatsapp;
        this.groupID = whatsApp.GROUP_ID;
        //@ts-ignore
        this.msgs = new Collection(null, 50);
    }

    async DiscordMessageCreate(message: Eris.Message) {
        if (message.author.bot || message.channel.id !== discord.CHANNEL_ID) return;
        let msgContent = `*${message.author.username}*:\n${message.cleanContent}`,
            reply;

        if (message.referencedMessage)
            reply = this.msgs
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

        await this.sendMessage(this.groupID, msgContent, message.attachments[0], reply);

        return;
    }

    async WhatsAppMessageCreate(message: venom.Message) {
        let { id, chat, type, mimetype } = message as venom.Message,
            //@ts-ignore o objeto de Message#Sender está incompleto e errado
            // esse novo tipo vai substituir o tipo original
            sender = message.sender as FixedSender,
            text = String(message.text).slice(0, 1980),
            isMedia = type !== 'chat' || message.isMedia ? true : false,
            // o objeto quotedMsgObj é declarado com o tipo never
            // e por isso ele fica sem propriedades
            quotedMsgObj = message.quotedMsgObj ? message.quotedMsgObj as venom.Message : null,
            senderPfp = sender?.profilePicThumbObj?.imgFull || await this.wpp.getProfilePicFromServer(sender.id) || '',
            senderName = sender?.pushname || sender?.displayName || sender?.formattedName || "Nome desconhecido";

        if (text === 'getID') {
            console.info(`ID of "${chat.name}": "${chat.id}"`);
            return sender.id.replace('@c.us', '') === whatsApp.OWNER_NUMBER
                ? this.groupID = chat.id
                : null;
        }
        if (chat.id != this.groupID) return;
        //@ts-ignore
        this.msgs.set(this.msgs.size, { id, text });

        if (text.startsWith('\u200b ')) return;
        
        let msgObj: WebhookPayload = {
            content: !isMedia ? text || '```diff\n- Anexo```' : text,
            avatarURL: senderPfp,
            username: senderName,
            embeds: [],
            file: undefined
        };
        
        if (isMedia)
            msgObj.file = {
                name: `anexo.${mime.extension(mimetype)}`,
                file: (await this.wpp.decryptFile(message))
            };

        if (quotedMsgObj) {
            let text = String(quotedMsgObj.text).slice(0, 1980),
                //@ts-ignore
                sender: FixedSender = quotedMsgObj.sender;

            let senderPfp = sender?.profilePicThumbObj?.imgFull || await this.wpp.getProfilePicFromServer(sender.id) || '',
                senderName = sender?.pushname || sender?.displayName || sender?.formattedName || "Nome desconhecido";

            msgObj.embeds = [{
                color: parseInt('ff0000', 16),
                author: {
                    name: text.startsWith('\u200b ')
                        ? text.split('\n')[0]
                        : senderName,
                    icon_url: senderPfp
                },
                description: text.startsWith('\u200b ') ? text.split('\n')[1] : text
            }]
        }

        this.discord.executeWebhook(discord.WEBHOOK.ID, discord.WEBHOOK.TOKEN, msgObj);

        return;
    }

    async sendMessage(chatId: string, content: string, anexo?: Attachment, reply?: venom.Message) {
        content = `\u200b ${content}`;

        if (anexo) {
            // fs.writeFileSync(`/media/${anexo.filename}`, await axios.get(anexo.url))

            await this.wpp
                .sendFile(chatId, anexo.url, anexo.filename, content)

            return;
        }


        if (reply)
            return await this.wpp.reply(chatId, content, reply.id);

        await this.wpp.sendText(chatId, content);

        return;
    }
}