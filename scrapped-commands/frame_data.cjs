const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

// const topLevel = (data) => {
//    let dataSub = data;

//    const games = fs.readdirSync(`../characterObjs/`);

//    for (const game of games) {
//       dataSub = dataSub.addSubcommandGroup((subcommand) => {
//          const dataSubSub = subcommand
//             .setName(game.toLowerCase())
//             .setDescription(game.toLowerCase());

//          return gameLevel(game, dataSubSub);
//       });
//    }

//    return dataSub;
// };

const gameLevel = (game, data) => {
   console.log("Logging game Level");
   let dataSub = data;

   const characters = fs.readdirSync(`../characterObjs/${game}`);
   const character = characters[0];

   // for (const character of characters) {
   const cleanCharacter = character.slice(0, character.length - 5);

   const charObj = require(`../../characterObjs/${game}/${character}`);

   dataSub = dataSub.addSubcommandGroup((subcommand) => {
      const dataSubSub = subcommand
         .setName(
            cleanCharacter
               .toLowerCase()
               .replaceAll(/[ -]/gi, "_")
               .replaceAll(/\W/gi, "")
         )
         .setDescription(
            cleanCharacter
               .toLowerCase()
               .replaceAll(/[ -]/gi, "_")
               .replaceAll(/\W/gi, "")
         );

      return characterLevel(charObj, dataSubSub);
   });
   // }

   return dataSub;
};

const characterLevel = (charObj, data) => {
   console.log("Logging character Level");
   let dataSub = data;

   const tables = Object.keys(charObj).filter(
      (table) => table !== "name" && table !== "game"
   );

   for (const table of tables) {
      const tableObj = charObj[table];

      dataSub = dataSub.addSubcommand((subcommand) => {
         const dataSubSub = subcommand
            .setName(
               table
                  .toLowerCase()
                  .replaceAll(/[ -]/gi, "_")
                  .replaceAll(/\W/gi, "")
                  .slice(0, 32)
            )
            .setDescription(
               table
                  .toLowerCase()
                  .replaceAll(/[ -]/gi, "_")
                  .replaceAll(/\W/gi, "")
                  .slice(0, 32)
            );

         return tableLevel(tableObj, dataSubSub, charObj.name, table);
      });
   }

   return dataSub;
};

const tableLevel = (tableObj, data) => {
   console.log("Logging table Level");

   const moves = Object.keys(tableObj);

   const movesChoices = [];

   for (const move of moves) {
      movesChoices.push({
         name: move.replaceAll(/[ -]/gi, "_"),
         value: move.replaceAll(/[ -]/gi, "_"),
      });
   }
   console.log(JSON.stringify(movesChoices, null, 2));

   return data.addStringOption((option) => {
      return option
         .setName("moves")
         .setDescription(`Returns frame data for a move/attribute`)
         .setRequired(true)
         .addChoices(...movesChoices);
   });
};

// const testLevel = (data) => {
//    const dataSub = data.addSubcommand((subcommand) =>
//       subcommand.setName("test").setDescription("test option")
//    );

//    return dataSub;
// };

const buildSlashCommand = () => {
   const data = new SlashCommandBuilder()
      .setName("frame_data")
      .setDescription(
         "Replies with frame data for characters in GGACR, GGXRD-R2, GGST, and BBCF"
      );

   return gameLevel("BBCF", data);
};

module.exports = {
   data: buildSlashCommand(),
   async execute(interaction) {
      return interaction.reply("xdd!");
   },
};
