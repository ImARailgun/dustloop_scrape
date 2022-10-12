import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { By } = webdriver;

async function selenTest(character) {
   const options = new chrome.Options();
   options.addArguments("--headless");
   options.addArguments("log-level=3");

   const driver = new webdriver.Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

   const url = `https://www.dustloop.com/w/GGACR/${character}/Frame_Data`;

   await driver.get(url);

   const characterObj = {};
   characterObj.name = character;

   await driver.sleep(1000);

   //list of h2 elements
   const tableHeaders = await assignTableHeaders(driver, character);

   // loop through table IDs until no more tables are found
   const tablePromises = tableHeaders.map(async (_, tableNum) => {
      const tableID = `DataTables_Table_${tableNum}`;

      // tableHeaders.length is arbitrary. Once there are no more tables to scrape,
      // the findElement() below will throw an error when "DataTables_Table_i" doesnt exist
      let tableNode;

      try {
         tableNode = await driver.findElement(By.id(tableID));
      } catch (error) {
         return undefined;
      }

      const tableName = tableHeaders[tableNum + 3];

      characterObj[tableName] = {};

      // saving column headers
      const columnHeaders = await getColumnHeaders(tableNode);

      // getting all row nodes for the table
      const rowNodes = await tableNode
         .findElement(By.css("tbody"))
         .findElements(By.css("tr"));

      // looping through each row node to save the data

      const rowPromises = rowNodes.map((row) =>
         scrapeRow(row, tableName, columnHeaders)
      );

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
            scrapedInfo[2][0] === "name" && scrapedInfo[2][1] !== ""
               ? scrapedInfo[2][1]
               : scrapedInfo[1][1];

         // adding the row to the table object
         const tableName = scrapedInfo.pop();

         characterObj[tableName][rowObjKey] = scrapedInfo;
      }
   }

   await driver.quit();
   return characterObj;
}

//CREATE SEPERATE FUNCTION FOR ABA

/**
 * main is the test case. Uncomment all characters if you want to blow up your CPU
 */
const main = async () => {
   const charNames = [
      // "A.B.A",
      // "Anji_Mito",
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
      "May",
      "Millia_Rage",
      "Order-Sol",
      "Potemkin",
      "Robo-Ky",
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

/**
 * assignTableHeaders uses the driver to get the text from all h2 nodes, and returns an array of those strings.
 */
const assignTableHeaders = async (driver, character) => {
   //fix cause ABA html is unique
   if (character === "A.B.A") {
      const headlineNodes = await driver.findElements(
         By.className("mw-headline")
      );
      const headlinePromises = headlineNodes.map((elem) => elem.getText());
      return Promise.all(headlinePromises);
   }

   const h2Nodes = await driver.findElements(By.css("h2"));
   const headerPromises = h2Nodes.map((elem) => elem.getText());
   return Promise.all(headerPromises);
};

/**
 * getColumnHeaders returns an array of column headers for a given table node.
 */
const getColumnHeaders = async (tableNode) => {
   const columnNodes = await tableNode
      .findElement(By.css("tr"))
      .findElements(By.css("th"));

   const header = columnNodes.map((node) => node.getText());

   return Promise.all(header);
};

/**
 * scrapeRow returns an array with every cell in the row scraped in the following format: [columnHeader, cellData]
 */
const scrapeRow = async (row, tableName, columnHeaders) => {
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
};

/**  data-details css attribute is a string with a ton of information used when the row is expanded to display an image of the move
 * this function parses the string for the stored src attribute which contains the image url
 * each image has 2 srcs listed. the code below correctly slices the 1st of the 2
 */
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

// stretch goal: system data, gattlings
