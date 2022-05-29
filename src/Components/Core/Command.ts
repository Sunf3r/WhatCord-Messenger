import { Whatsapp } from "venom-bot";

export default abstract class command implements Command {
    names!: string[];

    constructor(public wpp: Whatsapp) {
        this.wpp = wpp;
    }

    abstract execute(args: string[]): Promise<void>;

}