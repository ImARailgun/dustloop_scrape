import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// eslint-disable-next-line
const { clientId, guildId, token } = require("./config.json");
const commands = [];

const filename = fileURLToPath(import.meta.url);
const commandsPath = path.join(path.dirname(filename), "commands");

const commandFiles = fs
   .readdirSync(commandsPath)
   .filter((file) => file.endsWith(".cjs"));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);
   commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

rest
   .put(Routes.applicationCommands(clientId), { body: commands })
   .then(() => console.log("Successfully registered application commands."))
   .catch(console.error);
