import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { By } = webdriver;

async function selenTest(character) {
   const options = new chrome.Options();
   options.addArguments("--headless");
   const driver = new webdriver.Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

   const url = `https://www.dustloop.com/w/GGACR/${character}/Frame_Data`;

   await driver.get(url);

   const characterObj = {};
   characterObj.name = character;

   await driver.sleep(1000);

   //getting table header nodes
   const h2Nodes = await driver.findElements(By.css("h2"));
   const headerPromises = h2Nodes.map((elem) => elem.getText());

   //creating array of table headers
   const tableHeaders = await Promise.all(headerPromises);

   // loop through table IDs until no more tables are found
   const tablePromises = tableHeaders.map(async (_, tableNum) => {
      const tableID = `DataTables_Table_${tableNum}`;

      // tableHeaders.length is arbitrary. Once there are no more tables to scrape,
      // the findElement() below will throw an error when "DataTables_Table_i" doesnt exist
      let TableNode;

      try {
         TableNode = await driver.findElement(By.id(tableID));
      } catch (error) {
         return undefined;
      }

      const tableName = tableHeaders[tableNum + 3];

      characterObj[tableName] = {};

      // getting column headers
      const columnNodes = await TableNode.findElement(
         By.css("tr")
      ).findElements(By.css("th"));

      // saving column headers
      const columnHeaders = [];

      for (const node of columnNodes) {
         const header = await node.getText();
         columnHeaders.push(header);
      }

      // getting all row nodes for the table
      const rowNodes = await TableNode.findElement(
         By.css("tbody")
      ).findElements(By.css("tr"));

      // looping through each row node to save the data
      const rowPromises = rowNodes.map(async (row) => {
         const scrapedInfo = [];

         // saving the image url (located within a css attribute, not displayed on page load)
         const rowDetails = await row.getAttribute("data-details");
         scrapedInfo.push(["Image", parseforHref(rowDetails)]);

         // saving nodes for all cells in a row
         const moveInfo = await row.findElements(By.css("td"));
         let columnIndex = 0;

         const textPromises = moveInfo.map((node) => node.getText());
         const texts = await Promise.all(textPromises);

         // getting text from each cell node, and saving it with the appropriate collumn header
         for (const text of texts) {
            if (columnIndex !== 0) {
               scrapedInfo.push([columnHeaders[columnIndex], text]);
            }
            columnIndex++;
         }

         scrapedInfo.push(tableName);
         return scrapedInfo;
      });

      const rows = await Promise.all(rowPromises);

      console.log(`Scraped table ${tableName} for ${character}`);

      return rows;
   });

   const unfilteredTables = await Promise.all(tablePromises);
   const tables = unfilteredTables.filter((elem) => elem !== undefined);

   for (const rows of tables) {
      for (const scrapedInfo of rows) {
         // assigning a row's object key to the move name (or input if no name)
         const rowObjKey =
            scrapedInfo[2][0] === "name"
               ? scrapedInfo[2][1]
               : scrapedInfo[1][1];
         // adding the row to the table object
         characterObj[scrapedInfo[scrapedInfo.length - 1]][rowObjKey] =
            scrapedInfo;
      }
   }

   await driver.quit();
   return characterObj;
}

// data-details css attribute is a string with a ton of information used when the row is expanded to display an image of the move
// this function parses the string for the stored src attribute which contains the image url
// each image has 2 srcs listed. the code below correctly slices the 1st of the 2
const parseforHref = (string) => {
   const arr = string.split(" ");

   const imgURLs = [];
   let oddURLsOnly = true;
   for (const str of arr) {
      if (/^src/.test(str)) {
         if (oddURLsOnly) {
            imgURLs.push(`https://dustloop.com${str.slice(5, str.length - 1)}`);
         }
         oddURLsOnly = !oddURLsOnly;
      }
   }

   return imgURLs;
};

//CREATE SEPERATE FUNCTION FOR ABA

const main = async () => {
   const charNames = [
      // "A.B.A",
      "Anji_Mito",
      // "Axl_Low",
      // "Baiken",
      // "Bridget",
      // "Chipp_Zanuff",
      // "Dizzy",
      // "Eddie",
      // "Faust",
      // "I-No",
      // "Jam_Kuradoberi",
      // "Johnny",
      // "Justice",
      // "Kliff_Undersn",
      // "Ky_Kiske",
      // "May",
      // "Millia_Rage",
      // "Order-Sol",
      // "Potemkin",
      // "Robo-Ky",
      // "Slayer",
      // "Sol_Badguy",
      // "Testament",
      // "Venom",
      // "Zappa",
   ];

   const tests = charNames.map((elem) => selenTest(elem));

   const results = await Promise.all(tests);

   for (const char of results) {
      console.log(char.name);
      for (const key of Object.keys(char)) {
         if (char[key] !== char.name) console.log(key, Object.keys(char[key]));
      }
   }
};

main();

// buid a scraper for all character names, then loop throught them

// stretch goal: system data, gattlings
