# ⭐ WhatCord Messenger ⭐

### A simple bot that sends messages from a group on WhatsApp to Discord (and vice versa)

Someday I will update this again.

# How to install 🤔

- Recommended NodeJS version: 14.18.3 or higher

```bash
git clone https://github.com/Heryson1616/WhatCord-Messenger
cd WhatCord-Messenger
npm install
```
# Now configure the "src/JSON/settings.example.json" file
> ⚠️ before proceeding, rename the file to "settings.json"
```json
{
    "whatsApp": {
        "GROUP_ID": "group ID (you can find this on send 'getID' in a chat)",
        "OWNER_NUMBER": "your phone number"
    },
    "discord": {
        "BOT_TOKEN": "get it on https://discord.com/developers/applications/",
        "CHANNEL_ID": "the channel that will receive the messages",
        "WEBHOOK": {
            "ID": "webhook ID",
            "TOKEN": "webhook TOKEN"
        }
    }
}
```

And to start:
```bash
npm start
```