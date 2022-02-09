import WhatsApp from "@open-wa/wa-automate";
import Eris from "eris";
import { whatsApp, discord } from "./JSON/settings.json";
import { inspect } from "util";

export default class Events {
    discord: Eris.Client;
    whatsapp: WhatsApp.Client;
    groupID: WhatsApp.ChatId | string;
    constructor(discord: Eris.Client, whatsapp: WhatsApp.Client) {
        this.discord = discord;
        this.whatsapp = whatsapp;
        this.groupID = whatsApp.GROUP_ID;
    }

    async DiscordMessageCreate(message: Eris.Message) {
        if (message.author.bot || message.channel.id !== discord.CHANNEL_ID) return;
        let msgContent: string = `*${message.author.username}*:\n${message.cleanContent}`;

        if (message.content.toLowerCase().startsWith(".eval")) {
            let evaled: string = await eval(`${message.content.replace('.eval', '')}`);
            return message.channel.createMessage(`\`\`\`js\n${String(inspect(evaled)).slice(0, 1800)}\`\`\``);
        }

        return await this.sendMessage(this.groupID, msgContent);
    }

    async WhatsAppMessageCreate(message: WhatsApp.Message) {
        if (message.text === 'getID' && message.sender.id.replace('@c.us', '') !== whatsApp.OWNER_NUMBER) {
            this.groupID = message.chatId;
            return console.info(`ID of ${message.chat.name}: ${message.chatId}`);
        }

        if (message.chatId != this.groupID) return;

        return this.discord.executeWebhook(discord.WEBHOOK.ID, discord.WEBHOOK.TOKEN, {
            content: message.text || "```diff\n- Conteúdo desconhecido```",
            avatarURL: message.sender.profilePicThumbObj.imgFull || '',
            username: message.sender.pushname || message.sender.name || "Nome desconhecido",
        });
    }

    async sendMessage(chatId: WhatsApp.ChatId | string, content: string) {
        //@ts-ignore;
        return await this.whatsapp.sendText(chatId, content);
    }
}