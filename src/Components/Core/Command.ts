import { Whatsapp, Message } from "venom-bot";

export default abstract class command implements Command {
    names!: string[];

    constructor(public wpp: Whatsapp) {
        this.wpp = wpp;
    }

    abstract execute(message: Message, args: string[], reply: Function): Promise<void>;

}