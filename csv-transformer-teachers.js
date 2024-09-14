const path = require("path");
const { transformCsvTeachers } = require("./csvTransformer/teachers.js");

// 執行轉換
const inputPath = path.join(__dirname, "./before/teachers/new.csv");
const outputPath = path.join(__dirname, `./after/teachers/${new Date().getTime()}.csv`);

transformCsvTeachers(inputPath, outputPath)
  .then(() => console.log("CSV 轉換完成"))
  .catch((error) => console.error("CSV 轉換錯誤:", error));
