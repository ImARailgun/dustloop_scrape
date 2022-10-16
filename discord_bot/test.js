import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);

const name = path.dirname(filename);

console.log(name);
