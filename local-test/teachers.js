const path = require("path");
const { transformCSV } = require("../csvTransformer/teachers.js");
const { parseFile } = require("../utils/parseFile.js");

// 執行轉換
const inputPath = path.join(__dirname, "../before/teachers/new.csv");
const outputPath = path.join(
  __dirname,
  `../after/teachers/${new Date().getTime()}.csv`
);

parseFile(inputPath, outputPath, transformCSV)
  .then(() => console.log("CSV 轉換完成"))
  .catch((error) => console.error("CSV 轉換錯誤:", error));