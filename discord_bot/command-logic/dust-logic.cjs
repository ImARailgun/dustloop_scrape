// imbed notes:
// check for type of dataObj
// loop through keys to assign to values to the display array
// if key = image, have seperate logic that creates the image portion of imbed instead of assigning to display array
// make default imagePortion something that doesnt crash if there was no image key

module.exports = {
   async buildEmbed(request, dataObj) {
      const Title = request.replaceAll(";", " - ");

      let noHitboxURL = "";
      let initialHitboxURL = "";

      const fields = [];

      for (const key of Object.keys(dataObj)) {
         if (key === "Image") {
            noHitboxURL = dataObj[key].noHitbox ? dataObj[key].noHitbox : "";
            console.log("URL:", noHitboxURL);
            initialHitboxURL = dataObj[key].hitbox[0]
               ? dataObj[key].hitbox[0]
               : "";

            if (initialHitboxURL === "") {
               initialHitboxURL = noHitboxURL;
            } else if (initialHitboxURL[initialHitboxURL.length - 1] === "n") {
               initialHitboxURL += "g";
               initialHitboxURL =
                  "https://dustloop.com/" + initialHitboxURL.slice(24);
            }
         } else if (dataObj[key] && key !== "tableName") {
            fields.push({ name: key, value: dataObj[key], inline: true });
         }
      }

      return {
         content: "",
         tts: false,
         embeds: [
            {
               type: "rich",
               title: Title,
               description: "",
               color: 0x8d38dd,
               fields: fields,
               image: {
                  url: initialHitboxURL,
                  height: 200,
                  width: 200,
               },
               thumbnail: {
                  url: noHitboxURL,
                  height: 50,
                  width: 50,
               },
               // footer: {
               //    text: "\u3000".repeat(10) + "|",
               // },
            },
         ],
      };
   },
};
