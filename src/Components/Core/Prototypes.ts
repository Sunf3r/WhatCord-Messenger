import { User } from "eris";

export default function () {

    Object.defineProperties(User.prototype, {
        tag: {
            get() {
                return `${this.username}#${this.discriminator}`;
            }
        }
    })

}