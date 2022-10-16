import fs from "fs";

const char = "Izayoi";
const game = "BBCF";

let charObj;

const testRead = async () => {
   await fs.readFile(
      `./characterObjs/${game}/${char}.json`,
      "utf-8",
      (err, data) => {
         if (err) {
            console.log(err);
         } else {
            charObj = JSON.parse(data);
         }
      }
   );

   await setTimeout(() => {
      console.log(JSON.stringify(charObj["Normal Moves"]["5B"], null, 2));
   }, 50);
};

testRead();
