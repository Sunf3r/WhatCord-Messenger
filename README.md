# ⭐ WTD Bot ⭐

### A simple bot that sends messages from a group on WhatsApp to Discord (and vice versa)

Someday I will update this again.

# How to install 🤔

- Recommended NodeJS version: 14.18.1 or higher

```
git clone https://github.com/Heryson1616/whatsapp-to-discord
cd whatsapp-to-discord
npm install
```
# Now configure the ".env" file
```
#    DISCORD SETTINGS

DISCORD_BOT_TOKEN="token of the Discord Bot"
DISCORD_WEBHOOK="webhookID|webhookToken of the interaction chat"
DISCORD_CHANNEL_ID="channelID of the interaction chat"

#   WHATSAPP SETTINGS
GROUP_ID="id of the whatsapp group"
```

And to start:
```
npm start
```