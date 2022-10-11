const webdriver = require("selenium-webdriver");
const By = webdriver.By;

async function selenTest(character) {
   var driver = new webdriver.Builder().forBrowser("chrome").build();

   const url = `https://www.dustloop.com/w/GGACR/${character}/Frame_Data`;

   await driver.get(url);

   const characterObj = {};
   characterObj.name = character;

   //create array of table headers
   var h2Nodes = [];
   h2Nodes = await driver.findElements(By.css("h2"));
   const tableHeaders = [];
   for (const headerNode of h2Nodes) {
      var header = "";
      header = await headerNode.getText();

      tableHeaders.push(header);
   }

   //loop through table IDs until no more tables are found
   for (let tableNum = 0; tableNum < tableHeaders.length; tableNum++) {
      const tableID = `DataTables_Table_${String(tableNum)}`;

      //tableHeaders.length is arbitrary. Once there are no more tables to scrape,
      //the findElement() below will throw an error when "DataTables_Table_i" doesnt exist
      let TableNode;
      try {
         TableNode = await driver.findElement(By.id(tableID));
      } catch (error) {
         driver.quit();
         return characterObj;
      }

      //table name is sometimes undefined without this console log
      var tableName = tableHeaders[tableNum + 3];
      console.log(tableName);

      characterObj[tableName] = {};

      //getting collumn headers
      const columnNodes = await TableNode.findElement(
         By.css("tr")
      ).findElements(By.css("th"));

      //saving collumn headers
      const columnHeaders = [];

      for (const node of columnNodes) {
         let header = "";
         header = await node.getText();
         columnHeaders.push(header);
      }
      // columnNodes.forEach(async (node) => {
      //    await node.getText().then((text) => {
      //       columnHeaders.push(text);
      //    });
      // });

      //getting all row nodes for the table
      var rowNodes = await TableNode.findElement(By.css("tbody")).findElements(
         By.css("tr")
      );

      //looping through each row to save the data
      for (const row of rowNodes) {
         const scrapedInfo = [];

         //saving the image url (located within a css attribute, not displayed on page load)
         var rowDetails = await row.getAttribute("data-details");
         scrapedInfo.push(["Image", parseforHref(rowDetails)]);

         //saving nodes for all cells in a row
         const moveInfo = await row.findElements(By.css("td"));
         let columnIndex = 0;

         //getting text for each cell node, and saving it with the appropriate collumn header
         for (const node of moveInfo) {
            const text = await node.getText();
            if (columnIndex !== 0) {
               scrapedInfo.push([columnHeaders[columnIndex], text]);
            }

            columnIndex++;
         }

         //assigning a row's object key to the move name (or input if no name)
         let rowObjKey = "";
         if (scrapedInfo[2][0] === "name") {
            rowObjKey = scrapedInfo[2][1];
         } else {
            rowObjKey = scrapedInfo[1][1];
         }

         //adding the row to the table object
         characterObj[tableName][rowObjKey] = scrapedInfo;
         //uncomment line below to log each row in it's entirety instead of just a list of row keys
         //console.log(JSON.stringify(scrapedInfo, null, 2));
      }

      console.log(
         "Table scraped:",
         tableName,
         Object.keys(characterObj[tableName])
      );
   }

   driver.quit();
}

//data-details css attribute is a string with a ton of information used when the row is expanded to display an image of the move
//this function parses the string for the stored src attribute which contains the image url
//each image has 2 srcs listed. the code below correctly slices the 1st of the 2
const parseforHref = (string) => {
   const arr = string.split(" ");

   const imgURLs = [];
   var oddURLsOnly = true;
   for (const str of arr) {
      if (/^src/.test(str)) {
         if (oddURLsOnly) {
            imgURLs.push("https://dustloop.com" + str.slice(5, str.length - 1));
         }
         oddURLsOnly = !oddURLsOnly;
      }
   }

   return imgURLs;
};

//buid a scraper for all character names, then loop throught them
selenTest("Millia_Rage");
// selenTest("Baiken");
// selenTest("Zappa");

//stretch goal: system data, gattlings
