import type eris from "eris";

declare module 'eris' {
    interface User {
        tag: string;
    }
}

interface Error {
    stack: string;
    message: string;
}