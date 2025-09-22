import { v4 as uuid } from "uuid";
import fs from "fs";

export const logFunction = async (method, endPoint) => {
  const uniqueID = uuid();
  const dateTime = new Date();
  await fs.appendFileSync(
    "log of API requests/app.txt",
    `${uniqueID}\t${dateTime.getFullYear()}.${dateTime.getMonth()}.${dateTime.getDate()}\t${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()} \t ${method} (${endPoint}) \n`
  );
};
