const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../command-logic/dust-logic.cjs");

module.exports = {
   data: new SlashCommandBuilder()
      .setName("dust")
      .setDescription("Frame data for GGACR, GGXRD, GGST, and BBCF")
      .addStringOption((option) =>
         option
            .setName("request")
            .setDescription("Request format: Game Character DataTable Move.")
            .setAutocomplete(true)
      ),
   async execute(interaction) {
      let data = interaction.options._hoistedOptions[0].value;

      const truncatedKeys = await import("../index.js");

      if (truncatedKeys.default[0][data]) {
         data = truncatedKeys.default[0][data];
      }

      const keys = data.split(";");

      const charObj = require(`../../characterObjs/${keys[0]}/${keys[1]}.json`);

      const systemDataKeys = [
         "System Data",
         "System Data- Core Data",
         "System Data- Jump Data",
      ];

      let dataObj;

      if (systemDataKeys.indexOf(keys[2]) !== -1) {
         dataObj = charObj[keys[2]];
      } else {
         dataObj = charObj[keys[2]][keys[3]];
      }

      console.log(JSON.stringify(dataObj, null, 2));

      console.log(JSON.stringify(await buildEmbed(data, dataObj), null, 2));

      const response = await buildEmbed(data, dataObj);

      await interaction.reply(response);
   },
};
