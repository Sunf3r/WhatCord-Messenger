console.clear();
import Eris, { Client, ClientOptions } from "eris";
import venom, { create } from "venom-bot";
import Prototypes from "./Components/Core/Prototypes";
import settings from "./JSON/settings.json";
import Events from "./RunEvents";

Prototypes();
console.log('SYSTEM', "Iniciando aplicações", 46);

initClients()
    .catch((e: Error) => console.error(e));

async function initClients() {
    const isDev = process.argv.includes('--dev');

    const wpp = await create('whatcord',
        undefined,
        undefined,
        // (status, session) => console.log(String(session).toUpperCase(), `Status da sessão ${session}:`, status, 33),
        {
            multidevice: true,
            headless: false,
            useChrome: false,
            logQR: true
        }
    )

    const discord: Client = new Client(`Bot ${settings.discord.BOT_TOKEN}`, {
        intents: ['guilds', 'guildMessages', 'guildWebhooks'],
        maxShards: 1
    } as ClientOptions)
        .on("ready", () => {
            console.log('GATEWAY', `Sessão iniciada como ${discord.user.tag}`, 32);
            discord.editStatus('dnd', { type: 3, name: 'o celular do Legend caindo na privada' });
        })
        .on("error", (err: Error) => console.log('DISCORD', String(err.stack).slice(0, 256), 41));

    await discord.connect();
    let EventEmmiter = new Events(discord, wpp);

    wpp.onAnyMessage(async (message: venom.Message) => {
        if (isDev) {
            delete require.cache[require.resolve('./RunEvents')];
            EventEmmiter = new (require('./RunEvents'))(discord, wpp);
        }

        EventEmmiter.WhatsAppMessageCreate(message)
    });

    discord.on("messageCreate", (message: Eris.Message) => {
        if (isDev) {
            delete require.cache[require.resolve('./RunEvents')];
            EventEmmiter = new (require('./RunEvents'))(discord, wpp);
        }

        EventEmmiter.DiscordMessageCreate(message);
    });


    process
        .on('SIGINT', async () => {
            console.log('CLIENT', 'Encerrando...', 33);
            wpp.close();
            process.exit();
        })
        .on('unhandledRejection', (error: Error) => console.log('ANTI-CRASH', 'SCRIPT REJEITADO: ', String(error.stack).slice(0, 512), 31))
        .on("uncaughtException", (error: Error) => console.log('ANTI-CRASH', 'ERRO CAPTURADO: ', String(error.stack).slice(0, 512), 31))
        .on('uncaughtExceptionMonitor', (error: Error) => console.log('ANTI-CRASH', 'BLOQUEADO: ', String(error.stack).slice(0, 512), 31));


    return;
}
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