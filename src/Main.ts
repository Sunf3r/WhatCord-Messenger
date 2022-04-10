import whatsApp, { create, NotificationLanguage } from "@open-wa/wa-automate";
import Eris, { Client, ClientOptions } from "eris";
import Events from "./RunEvents";
import moment from "moment-timezone";
import settings from "./JSON/settings.json";
import Prototypes from "./Components/Core/Prototypes";

console.log = function () {
    let args = [...arguments];

    if (args[1] && typeof args[args.length - 1] !== 'number')
        return console.info(eval(args.map((_a, index) => `args[${index}]`).join(', ')));

    moment.locale("pt-BR");
    let color = args.pop(),
        str = `[ ${args.shift()} | ${moment.tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;

    return console.info(`\x1B[${color}m${str}\x1B[0m`);
}
console.error = function () {
    return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack).slice(0, 512), 31);
}

console.clear();
console.log('SYSTEM', "Iniciando aplicações", 46);

initClients()
    .catch((e: Error) => console.error(e));

async function initClients() {
    Prototypes();
    const isDev = process.argv.includes('--dev');

    const whatsappClient = await create({
        sessionId: "client",
        restartOnCrash: true,
        multiDevice: true,
        authTimeout: 60,
        blockCrashLogs: true,
        disableSpins: false, // remove expansive logs
        headless: false, // hide chromium window
        hostNotificationLang: NotificationLanguage.PTBR,
        logConsole: true,
        popup: false,
        qrTimeout: 0
    });

    const discord: Client = new Client(`Bot ${settings.discord.BOT_TOKEN}`, {
        intents: ['guilds', 'guildMessages', 'guildWebhooks'],
        maxShards: 1
    } as ClientOptions)
        .on("ready", () => {
            console.log('GATEWAY', `Sessão iniciada como ${discord.user.tag}`, 33);
            discord.editStatus('dnd', { type: 3, name: 'o celular do Legend caindo na privada' });
        })
        .on("error", (err: Error) => console.log('DISCORD', String(err.stack).slice(0, 256), 41));

    await discord.connect();

    let EventEmmiter = new Events(discord, whatsappClient);
    whatsappClient.onAnyMessage(async (message: whatsApp.Message) => {
        if (isDev) {
            delete require.cache[require.resolve('./RunEvents')];
            EventEmmiter = new (require('./RunEvents'))(discord, whatsappClient);
        }

        EventEmmiter.WhatsAppMessageCreate(message)
    });
    discord.on("messageCreate", (message: Eris.Message) => {
        if (isDev) {
            delete require.cache[require.resolve('./RunEvents')];
            EventEmmiter = new (require('./RunEvents'))(discord, whatsappClient);
        }

        EventEmmiter.DiscordMessageCreate(message);
    });

    return;
}

process
    .on('SIGINT', async () => {
        console.log('CLIENT', 'Encerrando...', 33);
        process.exit();
    })
    .on('unhandledRejection', (error: Error) => console.log('ANTI-CRASH', 'SCRIPT REJEITADO: ', String(error.stack).slice(0, 512), 31))
    .on("uncaughtException", (error: Error) => console.log('ANTI-CRASH', 'ERRO CAPTURADO: ', String(error.stack).slice(0, 512), 31))
    .on('uncaughtExceptionMonitor', (error: Error) => console.log('ANTI-CRASH', 'BLOQUEADO: ', String(error.stack).slice(0, 512), 31));

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