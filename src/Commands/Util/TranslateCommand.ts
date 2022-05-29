import Translator from "../../Components/Core/Translator";
import command from "../../Components/Core/Command";
import { Message } from "venom-bot";

export default class Translate extends command {
    names = ['translate', 'traduzir', 't'];

    async execute(message: Message, args: string[], reply: Function, ) {
        // if(!args[2]) return reply()

        // let data = await Translator.translate(args.slice(2).join(' '), args[0], args[1]);
    }
}