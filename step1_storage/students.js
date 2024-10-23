const detectStorage = require("../utils/detectStorage");

const detectStudentsCSV = () => {
  // 執行檔案檢查
  const csvFiles = detectStorage("students");
  return csvFiles;
};

module.exports = detectStudentsCSV;
