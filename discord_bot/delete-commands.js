import { REST, Routes } from "discord.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// eslint-disable-next-line
const { clientId, guildId, token } = require("./config.json");

const rest = new REST({ version: "10" }).setToken(token);

// delete all commands
rest
   .put(Routes.applicationCommands(clientId), { body: [] })
   .then(() => console.log("Successfully deleted all guild commands."))
   .catch(console.error);
