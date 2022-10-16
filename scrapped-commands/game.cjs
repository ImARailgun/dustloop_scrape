const {
   SlashCommandBuilder,
   // ActionRowBuilder,
   // ButtonBuilder,
   // ButtonStyle,
} = require("discord.js");
const fs = require("fs");

const games = [
   { name: "GGACR", value: "GGACR" },
   { name: "GGXRD-R2", value: "GGXRD-R2" },
   { name: "GGST", value: "GGST" },
   { name: "BBCF", value: "BBCF" },
];

module.exports = {
   data: new SlashCommandBuilder()
      .setName("game")
      .setDescription("Replies with a game!")
      .adds.addStringOption((option) =>
         option
            .setName("game")
            .setDescription("Returns list of characters in a game")
            .setRequired(true)
            .addChoices(...games)
      ),
   async execute(interaction) {
      const game = interaction.options._hoistedOptions[0].value;

      const charJSONs = fs.readdirSync(`../characterObjs/${game}/`);

      const charsInGame = charJSONs.map((fileName) => {
         return fileName.slice(0, fileName.length - 5).replaceAll("_", " ");
      });

      const response = [`Characters in ${game}:`]
         .concat(charsInGame)
         .join("\n");

      await interaction.reply(response);
   },
};
