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

    const wpp = await create(
        //session
        'whatcord',
        //catchQR
        (b64Str, qrCode, attempts, urlCode) => { },
        // statusFind
        (status, session) => {
            console.log(String(session).toUpperCase(), `Status da sessão ${session}:`, status, 33)
            // isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            //Create session wss return "serverClose" case server for close
        },
        // options
        {
            multidevice: true, // for version not multidevice use false.(default: true)
            folderNameToken: 'tokens', //folder name when saving tokens
            mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
            headless: false, // Headless chrome
            devtools: false, // Open devtools by default
            useChrome: true, // If false will use Chromium instance
            debug: false, // Opens a debug session
            logQR: true, // Logs QR automatically in terminal
            browserArgs: [
                '--no-zygote',
                '--log-level=3',
                '--disable-site-isolation-trials',
                '--no-experiments',
                '--ignore-gpu-blacklist',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-default-apps',
                '--enable-features=NetworkService',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--disable-webgl',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-threaded-animation',
                '--disable-threaded-scrolling',
                '--disable-in-process-stack-traces',
                '--disable-histogram-customizer',
                '--disable-gl-extensions',
                '--disable-composited-antialiasing',
                '--disable-canvas-aa',
                '--disable-3d-apis',
                '--disable-accelerated-2d-canvas',
                '--disable-accelerated-jpeg-decoding',
                '--disable-accelerated-mjpeg-decode',
                '--disable-app-list-dismiss-on-blur',
                '--disable-accelerated-video-decode',
                '--disable-dev-shm-usage',
                '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
                '--aggressive-cache-discard',
                '--disable-cache',
                '--disable-gl-drawing-for-tests',
                '--disable-application-cache',
                '--disable-offline-load-stale-cache',
                '--disk-cache-size=0'
            ], //Original parameters  ---Parameters to be added into the chrome browser instance
            puppeteerOptions: {}, // Will be passed to puppeteer.launch
            disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
            disableWelcome: true, // Will disable the welcoming message which appears in the beginning
            updatesLog: true, // Logs info updates automatically in terminal
            autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
            createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
            // addProxy: [''], // Add proxy server exemple : [e1.p.webshare.io:01, e1.p.webshare.io:01]
            // userProxy: '', // Proxy login username
            // userPass: '' // Proxy password
        },
        // BrowserSessionToken
        // To receive the client's token use the function await clinet.getSessionTokenBrowser()
        {
            WABrowserId: '"UnXjH....."',
            WASecretBundle:
                '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
            WAToken1: '"0i8...."',
            WAToken2: '"1@lPpzwC...."'
        },
        // BrowserInstance
        (browser, page) => {
            if (typeof browser !== 'string' && typeof page !== 'boolean') {
                console.log('Browser PID:', browser.process()!.pid);
                page.screenshot({ path: 'src/temp/screenshot.png' });
            }
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