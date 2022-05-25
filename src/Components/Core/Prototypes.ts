import moment from "moment-timezone";
import { User } from "eris";

export default function () {

    Object.defineProperties(User.prototype, {
        tag: {
            get() {
                return `${this.username}#${this.discriminator}`;
            }
        }
    })

    console.log = function () {
        let args = [...arguments]; // 'arguments' está presente em toda function normal 
        // e representa todos os parâmetros passados na função

        if (args[2] && typeof args[args.length - 1] === 'number' && args[0] === args[0].toUpperCase()) {
            let color = args.pop(), // color = args.last()
                str = `[ ${args.shift()} | ${moment.tz(Date.now(), 'America/Bahia').format('HH:mm')}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;

            console.info(`\x1B[${color}m${str}\x1B[0m`);
            // console.info === console.log
        } else console.info(...arguments);

        return;
    }
    console.error = function () {
        return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack).slice(0, 512), 31);
    }

}