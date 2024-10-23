const { Storage } = require("@google-cloud/storage");
const path = require("path");
const csv = require("csv-parser");
const readCsv = require("./readCSV");

// 設定 GCP Storage 的 bucket 和資料夾名稱
const BUCKET_NAME = "play-and-swim"; // 替換成你的 GCP Storage bucket 名稱

// 建立 GCP Storage 客戶端
const storage = new Storage({
  keyFilename: path.resolve(__dirname, "../play-and-swim-29fc056371c7.json"), // 可選: 指定憑證路徑
});

/**
 * 列出指定資料夾中的 CSV 文件
 * @returns {Promise<Array>} 返回 CSV 文件的清單
 */
const detectStorage = async (folderName) => {
  try {
    // 列出 GCS 中特定資料夾內的文件
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({
      prefix: folderName,
    });

    // 過濾出 .csv 文件
    const csvFiles = files.filter((file) => file.name.endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.log("沒有找到新的 CSV 文件。");
      return [];
    } else {
      console.log("找到的 CSV 文件:");
      console.log(csvFiles[0].name);

      // 讀取並解析 CSV 文件
      const csvData = await readCsv(csvFiles[0]); // 調用 readCsv 函數讀取並解析 CSV

      return csvData;
    }
  } catch (error) {
    console.error("Error checking for new CSV files:", error);
    return [];
  }
};

module.exports = detectStorage;
