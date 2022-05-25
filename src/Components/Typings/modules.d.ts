import type eris from "eris";
import type venom_bot from "venom-bot";

declare module 'eris' {
    interface User {
        tag: string;
    }
}

export interface FixedSender {
    id: string,
    pushname: string,
    type: string,
    isBusiness: boolean,
    isEnterprise: boolean,
    formattedName: string,
    displayName: string,
    formattedShortName: string,
    formattedShortNameWithNonBreakingSpaces: string,
    isMe: boolean,
    mentionName: string,
    notifyName: string,
    isMyContact: boolean,
    isPSA: boolean,
    isUser: boolean,
    isWAContact: boolean,
    profilePicThumbObj: {
        eurl: string,
        id: string,
        img: string,
        imgFull: string,
        raw: any,
        tag: string
    },
    msgs: any
}

declare module 'venom-bot' {
    interface Message {
        sender: FixedSender;
        quotedMsgObj: Message;
        text: string;
    }
}

interface Error {
    stack: string;
    message: string;
}