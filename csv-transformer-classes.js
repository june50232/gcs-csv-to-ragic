const path = require("path");
const { transformCsvClasses } = require("./csvTransformer/classes.js");

// 執行轉換
const inputPath = path.join(__dirname, "./before/classes/new.csv");
const outputPath = path.join(
  __dirname,
  `./after/classes/${new Date().getTime()}.csv`
);

transformCsvClasses(inputPath, outputPath)
  .then(() => console.log("CSV 轉換完成"))
  .catch((error) => console.error("CSV 轉換錯誤:", error));
