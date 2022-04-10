import WhatsApp, { decryptMedia } from "@open-wa/wa-automate";
import Eris, { Attachment, Collection, WebhookPayload } from "eris";
import { whatsApp, discord } from "./JSON/settings.json";
import { inspect } from "util";
const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

export default module.exports = class Events {
    discord: Eris.Client;
    whatsapp: WhatsApp.Client;
    groupID: WhatsApp.ChatId | string;
    wppMessages: Collection<WhatsApp.Message>;

    constructor(discord: Eris.Client, whatsapp: WhatsApp.Client) {
        this.discord = discord;
        this.whatsapp = whatsapp;
        this.groupID = whatsApp.GROUP_ID;
        //@ts-ignoreLl
        this.wppMessages = new Collection(null, 50);
    }

    async DiscordMessageCreate(message: Eris.Message) {
        if (message.author.bot || message.channel.id !== discord.CHANNEL_ID) return;
        let msgContent = `*${message.author.username}*:\n${message.cleanContent}`,
            reply;

        if (message.referencedMessage)
            reply = this.wppMessages
                .filter(m => !!m.text)
                .reverse()
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

    async WhatsAppMessageCreate(message: WhatsApp.Message) {
        if (message.text === 'getID') {
            console.info(`ID of "${message.chat.name}": "${message.chatId}"`);
            return message.sender.id.replace('@c.us', '') === whatsApp.OWNER_NUMBER
                ? this.groupID = message.chatId
                : null;
        }
        if (message.chatId != this.groupID) return;
        //@ts-ignore
        this.wppMessages.set(message.id, { id: message.id, text: message.text });

        if (message.text.startsWith('\u200b ')) return;

        let msgObj: WebhookPayload = {
            content: !message.isMedia ? message.text || '```diff\n- Conteúdo desconhecido```' : message.text,
            avatarURL: message.sender.profilePicThumbObj.imgFull || '',
            username: message.sender.pushname || message.sender.name || message.sender.formattedName || "Nome desconhecido",
            embeds: [],
            file: undefined
        }

        if (message.isMedia || message.type === 'sticker')
            msgObj.file = {
                name: `anexo.${String(message.mimetype).split('/')[1]}`,
                file: (await decryptMedia(message, uaOverride))
            };

        if (message.quotedMsg) {
            let { text, sender } = message.quotedMsg;
            msgObj.embeds = [{
                color: parseInt('ff0000', 16),
                author: {
                    name: text.startsWith('\u200b ')
                        ? text.split('\n')[0]
                        : sender.pushname || sender.name || sender.formattedName || "Nome desconhecido",
                    icon_url: sender.profilePicThumbObj.imgFull || ''
                },
                description: text.startsWith('\u200b ') ? text.split('\n')[1] : text
            }]
        }

        this.discord.executeWebhook(discord.WEBHOOK.ID, discord.WEBHOOK.TOKEN, msgObj);

        return;
    }

    async sendMessage(chatId: WhatsApp.ChatId | string, content: string, anexo?: Attachment, reply?: WhatsApp.Message) {
        content = `\u200b ${content}`;

        if (anexo)
            return await this.whatsapp
                .sendFileFromUrl(chatId as WhatsApp.ChatId, anexo.url, anexo.filename, content, reply ? reply.id : undefined);

        if (reply)
            return await this.whatsapp.reply(chatId as WhatsApp.ChatId, content, reply.id)

        await this.whatsapp.sendText(chatId as WhatsApp.ChatId, content);

        return;
    }
}