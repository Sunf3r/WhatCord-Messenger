interface Command {
    names: string[];
    cooldown?: number;
    category?: string;

    onlyDevs?: boolean;
    disabled?: boolean;
}