# Discord Image Gallery

Video example: https://imgur.com/a/AlQqhNo

Have you ever wanted to find that one image you remembered and wanted to show it to your friend, but you've been stuck searching for it for hours? Wait no more! Discord Image Gallery is for you! Instead of spending hours using `has:image`, you can just scroll down and look what you need and maybe even find something you completely forgotten.

## Usage
1. Change `DISCORD_TOKEN` to your Discord token in `index.js`. You can get the token by opening Chrome Developer Tools in Discord (Ctrl+Shift+I), clicking on `Console` tab and entering `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`. Now it should give you your Discord token. Now change `DISCORD_TOKEN` to your Discord token in `index.js`. Your Discord token is only used to search for images in your chosen channel (but don't share it with anyone).
2. Open `index.html` in your favourite browser
Note: it only works on localhost due to how CORS is handled on localhost
3. If you want to search in guild, change mode to `Guilds` and copy `Server ID` from Discord (right click server, Copy Server Id, you need developer mode for it) and paste it in `Channel/Guild ID` input box. For DMs/Group Chats, change mode to `DMs/Group Chats`, copy one of channel ids from Discord (right click on a message, copy message link and from the link copy the 2nd last long number) and paste it in `Channel/Guild ID` input box.

Always change mode and then paste your id, otherwise it will not update properly.

If you scroll too fast, Discord might rate limit you. What it means, is that you're too fast and you should wait a bit before scroll further.

## Credits
Made by ELginas in 2 days 😎
