import whatsApp, { create, NotificationLanguage } from "@open-wa/wa-automate";
import Eris from "eris";
import Events from "./RunEvents";
import express, { Request, Response } from "express";
import moment from "moment-timezone";
import settings from "./JSON/settings.json";

type err = {
    stack: string;
    message: string;
}
type colorChoices = 1 | 2 | 3 | 4 | 7 | 8 | 9 | 21 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 52 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107;
console.log = function () {
    moment.locale("pt-BR");
    let args: any[] = Object.entries(arguments).map(([_key, value]) => value),
        color: colorChoices = isNaN(args[args.length - 1]) ? 1 : args.pop(),
        setor: null | string = String(args[0]).split('/')[0].toUpperCase() === String(args[0]).split('/')[0]
            ? args.shift()
            : null,
        str: string = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;

    if (!setor) return console.info(args[0]);
    if (!process.argv.includes('--dev')) return console.info(str);
    return console.info(`\x1B[${color}m${str}\x1B[0m`);
}
console.error = function () {
    return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack).slice(0, 256), 41);
}

console.clear();
console.log('SYSTEM', "Iniciando aplicações", 46);

/* Iniciando servidor express */
const app = express();
app.get("/", (req: Request, res: Response) => res.sendStatus(200));
app.listen(process.env.PORT);

initClients()
    .catch((e: Error) => console.error(e));


async function initClients() {
    const whatsappClient = await create({
        sessionId: "client",
        multiDevice: true,
        authTimeout: 60,
        blockCrashLogs: true,
        disableSpins: false, // remove expansive logs
        headless: true, // hide chromium window
        hostNotificationLang: NotificationLanguage.PTBR,
        logConsole: false,
        popup: false,
        qrTimeout: 0,
    });

    //@ts-ignore
    const discord: Eris.Client = (new Eris(`Bot ${settings.discord.BOT_TOKEN}`, {
        intents: ['guilds', 'guildMessages'],
        maxShards: 1
    } as Eris.ClientOptions))
        .on("ready", () => {
            console.log('GATEWAY', `Sessão iniciada como ${discord.user.username}#${discord.user.discriminator}`, 33);
            discord.editStatus('dnd', { type: 3, name: 'o celular do Legend caindo na privada' });
        })
        .on("error", (err: Error) => console.log('DISCORD', String(err.stack).slice(0, 256), 41));
    await discord.connect();


    const EventEmmiter = new Events(discord, whatsappClient);
    whatsappClient.onMessage(async (message: whatsApp.Message) => EventEmmiter.WhatsAppMessageCreate(message));
    discord.on("messageCreate", (message: Eris.Message) => EventEmmiter.DiscordMessageCreate(message));
}

process
    .on('unhandledRejection', (error: err) => console.log('SCRIPT REJEITADO: ', String(error.stack.slice(0, 256)), 41))
    .on("uncaughtException", (error: err) => console.log('ERRO CAPTURADO: ', String(error.stack.slice(0, 256)), 41))
    .on('uncaughtExceptionMonitor', (error: err) => console.log('BLOQUEADO: ', String(error.stack.slice(0, 256)), 41));

/**
* TONS DE BRANCO E CINZA
* 1 branco
* 2 cinza
* 3 itálico
* 4 sublinhado
* 7 branco back
* 8 preto
* 9 branco traçado sla
* 21 branco sublinhado
* 
* TONS COLORIDOS ESCUROS
* 30 preto
* 31 vermelho
* 32 verde
* 33 amarelo
* 34 azul escuro
* 35 roxo
* 36 ciano
* 
* TONS DE BACKGROUND ESCUROS
* 41 vermelho back
* 42 verde back
* 43 amarelo back
* 44 azul back
* 45 roxo back
* 46 ciano back
* 47 branco back
* 
* 52 branco sublinhado
* 
* TONS COLORIDOS CLAROS
* 90 cinza
* 91 vermelho
* 92 verde
* 93 branco
* 94 azul claro
* 95 rosa
* 96 ciano
* 97 branco
* 
* TONS DE BACKGROUND CLAROS
* 100 cinza back
* 101 vermelho
* 102 verde
* 103 branco
* 104 azul
* 105 roxo
* 106 ciano
* 107 branco
*/