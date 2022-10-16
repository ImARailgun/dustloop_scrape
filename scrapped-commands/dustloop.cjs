const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

module.exports = {
   data: new SlashCommandBuilder()
      .setName("dustloop")
      .setDescription("Replies with frame data based on request")
      .addStringOption((option) =>
         option
            .setName("details")
            .setDescription("Game/Character/DataTable/Move")
            .setRequired(false)
      ),
   async execute(interaction) {
      const input = interaction.options._hoistedOptions[0].value.split("/");
      console.log(JSON.stringify(input, null, 2));

      const supportedGames = fs.readdirSync(`../characterObjs/`);

      let responseText = "error";

      // fzf java script
      if (
         input.length < 1 ||
         supportedGames.indexOf(input[0].toUpperCase()) === -1
      ) {
         responseText =
            "Invalid game. Valid games listed below:\n" +
            supportedGames.join("\n");
         return await interaction.reply(responseText);
      }

      const game = input[0].toUpperCase();
      const supportedCharacters = fs.readdirSync(`../characterObjs/${game}`);
      const cleanedCharacters = supportedCharacters.map((fileName) => {
         return fileName.slice(0, fileName.length - 5);
      });

      if (input.length < 2 || cleanedCharacters.indexOf(input[1]) === -1) {
         responseText =
            "Invalid character. Valid characters listed below:\n" +
            cleanedCharacters.join("\n");
         return await interaction.reply(responseText);
      }

      const character = input[1];
      const characterObj = require(`../../characterObjs/${game}/${character}.json`);

      const table = input[2];
      const tableArr = Object.keys(characterObj);

      if (input.length < 3 || tableArr.indexOf(table) === -1) {
         responseText =
            "Invalid table. Valid tables listed below:\n" + tableArr.join("\n");
         return await interaction.reply(responseText);
      }

      const key = input[3];
      const keyArr = Object.keys(characterObj[table]);

      if (input.length < 4 || keyArr.indexOf(key) === -1) {
         responseText =
            "Invalid Move/Attribute. Valid options listed below:\n" +
            keyArr.join("\n");
         return await interaction.reply(responseText);
      }

      const data = characterObj[table][key];

      const dataText = JSON.stringify(data, null, 2);

      responseText = `${character} ${table} ${key} Data:\n` + dataText;

      return await interaction.reply(responseText);
   },
};
