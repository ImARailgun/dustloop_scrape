import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import fs from "fs";

//TO DO:
//CORRECT THE PARSING FOR WINGER IMAGES (url parsing for any move with 4+ hitbox images)

const { By } = webdriver;

async function selenTest(character, game) {
   const options = new chrome.Options();
   options.addArguments("--headless");
   options.addArguments("log-level=3");

   const driver = new webdriver.Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

   const url = `https://www.dustloop.com/w/${game}/${character}/Frame_Data`;

   await driver.get(url);

   const characterObj = {};
   characterObj.name = character;
   characterObj.game = game;

   await driver.sleep(1000);

   //array of tableHeaders to assign table names later on
   const tableHeaders = await assignTableHeaders(driver, character);

   //System Data Table html labled seperately
   if (character === "A.B.A") {
      //A.B.A. tableHeaders are unique
      const systemTables = await getSystemData(driver, 1).catch({});
      characterObj["System Data"] = systemTables[0];
   } else if (game === "GGST") {
      //GGST has two system data tables with different table name html that cannot be scraped concurrently with other games
      const systemTables = await getSystemData(driver, 2).catch({});
      characterObj["System Data- Core Data"] = systemTables[0];
      characterObj["System Data- Jump Data"] = systemTables[1];
   } else {
      const systemTables = await getSystemData(driver, 1).catch({});
      characterObj[tableHeaders[2]] = systemTables[0];
   }
   console.log(`Scraped table System Data for ${character} from ${game}`);

   //all ID'd Data Tables
   const tablePromises = tableHeaders.map(async (_, tableNum) => {
      const tableID = `DataTables_Table_${tableNum}`;

      let tableNode;

      // loop through table IDs until no more tables are found
      // catch error once "DataTables_Table_i" doesnt exist
      try {
         tableNode = await driver.findElement(By.id(tableID));
      } catch (error) {
         return undefined;
      }

      const tableName = tableHeaders[tableNum + 3];

      characterObj[tableName] = {};

      const columnHeaders = await getColumnHeaders(tableNode);

      const rowNodes = await tableNode
         .findElement(By.css("tbody"))
         .findElements(By.css("tr"));

      // scraping of each cell in each row in table
      const rowPromises = rowNodes.map((row) =>
         scrapeRow(row, tableName, columnHeaders)
      );

      const rows = await Promise.all(rowPromises);

      console.log(`Scraped table ${tableName} for ${character} from ${game}`);

      //array of objects with the scraped info for each row
      return rows;
   });

   const unfilteredTables = await Promise.all(tablePromises);
   const tables = unfilteredTables.filter((elem) => elem !== undefined);

   for (const rows of tables) {
      for (const scrapedInfo of rows) {
         const rowObjKey =
            scrapedInfo.name && scrapedInfo.name !== ""
               ? scrapedInfo.name
               : scrapedInfo.input;

         const tableName = scrapedInfo.tableName;

         // assigning each row object to the character object
         characterObj[tableName][rowObjKey] = scrapedInfo;
      }
   }

   const gattlingTables = await getGattlingTables(driver);

   for (const table of gattlingTables) {
      characterObj[table[0]] = table[1];
      console.log(`Scraped table ${table[0]} for ${character} from ${game}`);
   }

   await driver.quit();

   const charJSONString = JSON.stringify(characterObj);
   const fileName = `./characterObjs/${characterObj.game}/${characterObj.name}.json`;

   // await fs.writeFile(fileName, charJSONString, "utf-8", function (err) {
   //    if (err) {
   //       console.log(`error occured with: ${fileName}`);
   //    }
   // });

   return characterObj;
}

const main = async () => {
   const charGGACR = [
      // ["A.B.A", "GGACR"],
      // ["Anji_Mito", "GGACR"],
      // ["Axl_Low", "GGACR"],
      // ["Baiken", "GGACR"],
      // ["Bridget", "GGACR"],
      // ["Chipp_Zanuff", "GGACR"],
      // ["Dizzy", "GGACR"],
      // ["Eddie", "GGACR"],
      // ["Faust", "GGACR"],
      // ["I-No", "GGACR"],
      // ["Jam_Kuradoberi", "GGACR"],
      // ["Johnny", "GGACR"],
      // ["Justice", "GGACR"],
      // ["Kliff_Undersn", "GGACR"],
      // ["Ky_Kiske", "GGACR"],
      // ["May", "GGACR"],
      // ["Millia_Rage", "GGACR"],
      // ["Order-Sol", "GGACR"],
      // ["Potemkin", "GGACR"],
      // ["Robo-Ky", "GGACR"],
      // ["Slayer", "GGACR"],
      // ["Sol_Badguy", "GGACR"],
      // ["Testament", "GGACR"],
      // ["Venom", "GGACR"],
      // ["Zappa", "GGACR"],
   ];

   const charGGXRDR2 = [
      // ["Answer", "GGXRD-R2"],
      // ["Axl_Low", "GGXRD-R2"],
      // ["Baiken", "GGXRD-R2"],
      // ["Bedman", "GGXRD-R2"],
      // ["Chipp_Zanuff", "GGXRD-R2"],
      // ["Dizzy", "GGXRD-R2"],
      // ["Elphelt_Valentine", "GGXRD-R2"],
      // ["Faust", "GGXRD-R2"],
      // ["I-No", "GGXRD-R2"],
      // ["Jack-O", "GGXRD-R2"],
      // ["Jam_Kuradoberi", "GGXRD-R2"],
      // ["Johnny", "GGXRD-R2"],
      // ["Kum_Haehyun", "GGXRD-R2"],
      // ["Ky_Kiske", "GGXRD-R2"],
      // ["Leo_Whitefang", "GGXRD-R2"],
      // ["May", "GGXRD-R2"],
      // ["Millia_Rage", "GGXRD-R2"],
      // ["Potemkin", "GGXRD-R2"],
      // ["Ramlethal_Valentine", "GGXRD-R2"],
      // ["Raven", "GGXRD-R2"],
      // ["Sin_Kiske", "GGXRD-R2"],
      // ["Slayer", "GGXRD-R2"],
      // ["Sol_Badguy", "GGXRD-R2"],
      // ["Venom", "GGXRD-R2"],
      // ["Zato-1", "GGXRD-R2"],
   ];

   const charBBCF = [
      // ["Amane_Nishiki", "BBCF"],
      // ["Arakune", "BBCF"],
      // ["Azrael", "BBCF"],
      // ["Bang_Shishigami", "BBCF"],
      // ["Bullet", "BBCF"],
      // ["Carl_Clover", "BBCF"],
      // ["Celica_A._Mercury", "BBCF"],
      // ["Es", "BBCF"],
      // ["Hakumen", "BBCF"],
      // ["Hazama", "BBCF"],
      // ["Hibiki_Kohaku", "BBCF"],
      // ["Iron_Tager", "BBCF"],
      // ["Izanami", "BBCF"],
      ["Izayoi", "BBCF"],
      // ["Jin_Kisaragi", "BBCF"],
      // ["Jubei", "BBCF"],
      // ["Kagura_Mutsuki", "BBCF"],
      // ["Kokonoe", "BBCF"],
      // ["Lambda-11", "BBCF"],
      // ["Litchi_Faye_Ling", "BBCF"],
      // ["Mai_Natsume", "BBCF"],
      // ["Makoto_Nanaya", "BBCF"],
      // ["Mu-12", "BBCF"],
      // ["Naoto_Kurogane", "BBCF"],
      // ["Nine_the_Phantom", "BBCF"],
      // ["Noel_Vermillion", "BBCF"],
      // ["Nu-13", "BBCF"],
      // ["Platinum_the_Trinity", "BBCF"],
      // ["Rachel_Alucard", "BBCF"],
      // ["Ragna_the_Bloodedge", "BBCF"],
      // ["Relius_Clover", "BBCF"],
      // ["Susanoo", "BBCF"],
      // ["Taokaka", "BBCF"],
      // ["Tsubaki_Yayoi", "BBCF"],
      // ["Valkenhayn_R._Hellsing", "BBCF"],
      // ["Yuuki_Terumi", "BBCF"],
   ];

   const charGGST = [
      // ["Anji_Mito", "GGST"],
      // ["Axl_Low", "GGST"],
      // ["Baiken", "GGST"],
      // ["Bridget", "GGST"],
      // ["Chipp_Zanuff", "GGST"],
      // ["Faust", "GGST"],
      // ["Giovanna", "GGST"],
      // ["Goldlewis_Dickinson", "GGST"],
      // ["Happy_Chaos", "GGST"],
      // ["I-No", "GGST"],
      // ["Jack-O", "GGST"],
      // ["Ky_Kiske", "GGST"],
      // ["Leo_Whitefang", "GGST"],
      // ["May", "GGST"],
      // ["Millia_Rage", "GGST"],
      // ["Nagoriyuki", "GGST"],
      // ["Potemkin", "GGST"],
      // ["Ramlethal_Valentine", "GGST"],
      // ["Sol_Badguy", "GGST"],
      // ["Testament", "GGST"],
      // ["Zato-1", "GGST"],
   ];

   const charTests = charGGACR
      .concat(charGGXRDR2)
      .concat(charBBCF)
      .concat(charGGST);

   const tests = charTests.map((elem) => selenTest(elem[0], elem[1]));

   const results = await Promise.all(tests);

   for (const char of results) {
      console.log(char.name);
      console.log(char.game);
      for (const key of Object.keys(char)) {
         if (key !== "name" && key !== "game")
            console.log(key, Object.keys(char[key]));
      }
   }
};

main();

/**
 * assignTableHeaders uses the driver to get the text from all h2 nodes, and returns an array of those strings.
 */
const assignTableHeaders = async (driver, character) => {
   //fix cause ABA's html is unique
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
 * getSystemData returns an object scraped from the system data table
 */
const getSystemData = async (driver, num) => {
   const tableNodes = await driver.findElements(
      By.className("cargoTable noMerge sortable jquery-tablesorter")
   );

   const tablePromises = tableNodes.map(async (tableNode) => {
      const systemData = {};

      const headerNodes = await tableNode
         .findElement(By.css("thead"))
         .findElements(By.css("th"));

      const headerPromises = headerNodes.map((node) => node.getText());

      const headerTexts = await Promise.all(headerPromises);

      const rowNodes = await tableNode
         .findElement(By.css("tbody"))
         .findElements(By.css("tr"));

      const rowPromises = rowNodes.map((node) =>
         node.findElements(By.css("td"))
      );
      //rowNodes.map((node) => node.getText());
      const rowAndCellNodes = await Promise.all(rowPromises);

      for (const row of rowAndCellNodes) {
         const rowText = [];
         for (const cell of row) {
            const text = await cell.getText();
            rowText.push(text);
         }
         if (rowAndCellNodes.length > 1) {
            systemData[rowText[0]] = {};
         }
         rowText.forEach((text, index) => {
            if (rowAndCellNodes.length > 1) {
               systemData[rowText[0]][headerTexts[index]] = text;
            } else {
               systemData[headerTexts[index].toLowerCase()] = text;
            }
         });
      }

      return systemData;
   });

   return await Promise.all(tablePromises.slice(0, num));
};

/**
 * getColumnHeaders returns an array of column headers for a given table node.
 */
const getColumnHeaders = async (tableNode) => {
   const columnNodes = await tableNode
      .findElement(By.css("tr"))
      .findElements(By.css("th"));

   const header = columnNodes.map((node) => node.getText());

   const texts = await Promise.all(header);

   return texts.map((elem) => elem.toLowerCase());
};

/**
 * scrapeRow returns an object with every cell in the row scraped in the following format: {columnHeader: cellData}
 */
const scrapeRow = async (row, tableName, columnHeaders) => {
   const scrapedInfo = {};

   // saving the image url (located within a css attribute, not displayed on page load)
   const rowDetails = await row.getAttribute("data-details");
   scrapedInfo.Image = parseforHref(rowDetails);

   // saving nodes for all cells in a row
   const moveInfo = await row.findElements(By.css("td"));
   let columnIndex = 0;

   const textPromises = moveInfo.map((node) => node.getText());
   const texts = await Promise.all(textPromises);

   // getting text from each cell node, and saving it with the appropriate collumn header
   for (const text of texts) {
      if (columnIndex !== 0) {
         scrapedInfo[columnHeaders[columnIndex]] = text;
      }

      columnIndex++;
   }

   scrapedInfo.tableName = tableName;

   return scrapedInfo;
};

const getGattlingTables = async (driver) => {
   const tableNodes = await driver.findElements(
      By.xpath(
         "//table[@style='text-align: center; margin: 1em auto 1em auto;']"
      )
   );

   const tablePromises = tableNodes.map(async (table) => {
      const scrapedTable = {};
      const caption = await table.findElement(By.css("caption")).getText();
      const rowNodes = await table
         .findElement(By.css("tbody"))
         .findElements(By.css("tr"));

      const rowPromises = rowNodes.map(async (rowNode, i) => {
         if (i === 0) {
            const headerNodes = await rowNode.findElements(By.css("th"));
            const headerTexts = ["Move"];

            for (const node of headerNodes) {
               const text = await node.getText();
               if (text !== "") {
                  headerTexts.push(text);
               }
            }

            return headerTexts;
         }

         const rowText = [];

         let firstColumnText = await rowNode
            .findElement(By.css("th"))
            .getText();

         //clean any exponents in text
         if (firstColumnText.indexOf("\n") !== -1) {
            firstColumnText = firstColumnText.slice(
               0,
               firstColumnText.indexOf("\n")
            );
         }

         rowText.push(firstColumnText);

         const otherCellNodes = await rowNode.findElements(By.css("td"));

         for (const node of otherCellNodes) {
            let text = await node.getText();

            //provide info on legend symbols in text
            if (text.indexOf("-") !== -1 && text.length > 3) {
               text = text.replaceAll("-", "only on hit");
            }
            if (text.indexOf("+") !== -1) {
               text = text.replaceAll("+", "+ on whiff");
            }

            rowText.push(text);
         }

         return rowText;
      });

      const rowTexts = await Promise.all(rowPromises);

      for (let i = 1; i < rowTexts.length; i++) {
         const rowObj = {};

         rowTexts[i].forEach((cell, column) => {
            if (column !== 0) {
               rowObj[rowTexts[0][column]] = cell;
            }
         });
         scrapedTable[rowTexts[i][0]] = rowObj;
      }

      return [caption, scrapedTable];
   });

   return await Promise.all(tablePromises);
};

/**  parseforHref takes a string of the data-details css attribute, and returns an object with image URLs.
 *   the data-details css is a long string of html attributes.
 *   This string is used whenever the user clicks a row to expand it and show images.
 *   Since the images are not displayed on the intital page load, the data-details string is sparsed for the image src urls.
 */
const parseforHref = (string) => {
   const arr = string.split(" ");

   const imgURLs = {};
   const hitboxUrls = [];
   let oddURLsOnly = true;
   let firstUrl = true;
   for (const str of arr) {
      if (/^src/.test(str)) {
         if (oddURLsOnly) {
            if (firstUrl) {
               imgURLs.noHitbox = `https://dustloop.com${str.slice(
                  5,
                  str.length - 1
               )}`;
               firstUrl = !firstUrl;
            } else {
               hitboxUrls.push(
                  `https://dustloop.com${str.slice(5, str.length - 1)}`
               );
            }
         }
         oddURLsOnly = !oddURLsOnly;
      }
   }

   imgURLs.hitbox = hitboxUrls;

   return imgURLs;
};
