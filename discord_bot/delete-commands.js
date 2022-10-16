import { REST, Routes } from "discord.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { clientId, guildId, token } = require("./config.json");

const rest = new REST({ version: "10" }).setToken(token);

// remove guild ID parameter to delete form all servers

// delete command with a particular ID for one server
// rest
//    .delete(Routes.applicationGuildCommand(clientId, guildId, "command ID here"))
//    .then(() => console.log("Successfully deleted guild command"))
//    .catch(console.error);

// delete all commands
rest
   .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
   .then(() => console.log("Successfully deleted all guild commands."))
   .catch(console.error);
