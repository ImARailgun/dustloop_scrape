import { Client, Collection, GatewayIntentBits } from "discord.js";
import { createRequire } from "module";
import { Fzf } from "fzf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);

const allOptions = [];
const allOptionsKeys = {};
const truncatedKeys = {};

const games = fs.readdirSync(`../characterObjs/`);

for (const game of games) {
   const characters = fs.readdirSync(`../characterObjs/${game}`);
   for (const character of characters) {
      const charObj = require(`../characterObjs/${game}/${character}`);
      const cleanCharacter = character.slice(0, character.length - 5);

      for (const table in charObj) {
         if (table !== "name" && table !== "game") {
            for (const move in charObj[table]) {
               const displayText =
                  `${game} ${cleanCharacter} ${table} ${move}`.slice(0, 100);
               const keyText =
                  `${game};${cleanCharacter};${table};${move}`.slice(0, 100);

               if (`${game};${cleanCharacter};${table};${move}`.length > 100) {
                  truncatedKeys[
                     keyText
                  ] = `${game};${cleanCharacter};${table};${move}`;
               }
               allOptions.push(displayText);
               allOptionsKeys[displayText] = keyText;
            }
         }
      }
   }
}

const fzf = new Fzf(allOptions, { limit: 6, casing: "case-insensitive" });

const token = require("./config.json").token;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const filename = fileURLToPath(import.meta.url);
const commandsPath = path.join(path.dirname(filename), "commands");
const commandFiles = fs
   .readdirSync(commandsPath)
   .filter((file) => file.endsWith(".cjs"));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);

   client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
   const command = interaction.client.commands.get(interaction.commandName);

   if (interaction.commandName === "dust" && interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);

      let focussedText;

      if (!focusedOption.value) {
         focussedText = "";
      } else {
         focussedText = focusedOption.value;
      }

      const choices = fzf.find(focussedText);

      await interaction.respond(
         choices.map((choice) => ({
            name: choice.item,
            value: allOptionsKeys[choice.item],
         }))
      );
   }

   if (!interaction.isChatInputCommand()) return;

   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      await interaction.reply({
         content: "There was an error while executing this command!",
         ephemeral: true,
      });
   }
});

client.once("ready", () => {
   console.log("Ready!");
});

client.login(token);

export default [truncatedKeys];
