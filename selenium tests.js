import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
const By = webdriver.By;

async function selenTest(character) {
   // I made this headless so it operates only in the terminal. Save you some tabs.

   const url = `https://www.dustloop.com/w/GGACR/${character}/Frame_Data`;
   options.addArguments("--headless");

   const driver = new webdriver.Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

   const url = `https://www.dustloop.com/w/GGACR/${character}/Frame_Data`;

   await driver.get(url);

   const characterObj = {};
   characterObj.name = character;

   // Experienced a weird bug, just need to wait for the page to load here.
   await driver.sleep(1000);

   // create array of table headers
   const h2Nodes = await driver.findElements(By.css("h2"));
   const tableHeaders = [];
   for (const headerNode of h2Nodes) {
      const header = await headerNode.getText();

      tableHeaders.push(header);
   }

   // loop through table IDs until no more tables are found
   for (let i = 0; i < tableHeaders.length; i++) {
      const tableID = `DataTables_Table_${i}`;
      //tableHeaders.length is arbitrary. Once there are no more tables to scrape,
      //the findElement() below will throw an error when "DataTables_Table_i" doesnt exist

      let tableNode;
      try {
         tableNode = await driver.findElement(By.id(tableID));
      } catch (_) {
         // Exit loop once we've run out of tables.
         break;
      }

      const tableName = tableHeaders[i + 3];
      characterObj[tableName] = {};

      // getting column headers
      const columnNodes = await tableNode
         .findElement(By.css("tr"))
         .findElements(By.css("th"));

      // saving column headers
      const columnHeaders = [];
      for (const node of columnNodes) {
         const text = await node.getText();
         columnHeaders.push(text);
      }

      // getting all row nodes for the table
      const rowNodes = await tableNode
         .findElement(By.css("tbody"))
         .findElements(By.css("tr"));

      // looping through each row to save the data
      for (const row of rowNodes) {
         const scrapedInfo = [];

         // saving the image url (located within a css attribute, not displayed on page load)
         var rowDetails = await row.getAttribute("data-details");
         scrapedInfo.push(["Image", parseforHref(rowDetails)]);

         // saving nodes for all cells in a row
         const moveInfo = await row.findElements(By.css("td"));
         let columnIndex = 0;

         // getting text for each cell node, and saving it with the appropriate collumn header
         for (const node of moveInfo) {
            const text = await node.getText();
            if (columnIndex !== 0) {
               scrapedInfo.push([columnHeaders[columnIndex], text]);
            }

            columnIndex++;
         }

         // assigning a row's object key to the move name (or input if no name)
         const rowObjKey =
            scrapedInfo[2][0] === "name"
               ? scrapedInfo[2][1]
               : scrapedInfo[1][1];

         //adding the row to the table object
         characterObj[tableName][rowObjKey] = scrapedInfo;
         //uncomment line below to log each row in it's entirety instead of just a list of row keys
         //console.log(JSON.stringify(scrapedInfo, null, 2));
      }

      console.log(`Scraped table ${tableName} for ${character}`);
   }
   await driver.quit();

   return characterObj;
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

// build a scraper for all character names, then loop throught them

// You can't await outside async functions, so we have an entry function here.
const main = async () => {
   const tests = [
      selenTest("Millia_Rage"),
      selenTest("Baiken"),
      selenTest("Zappa"),
   ];

   const results = await Promise.all(tests);

   for (const char of results) {
      console.log(char.name);
      for (const key of Object.keys(char)) {
         if (char[key] !== char.name) console.log(Object.keys(char[key]));
      }
   }
};

main();

// stretch goal: system data, gattlings
