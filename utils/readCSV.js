const { Storage } = require("@google-cloud/storage");
const path = require("path");
const csv = require("csv-parser");

// 設定 GCP Storage 的 bucket 和資料夾名稱
const BUCKET_NAME = "play-and-swim"; // 替換成你的 GCP Storage bucket 名稱

// 建立 GCP Storage 客戶端
const storage = new Storage({
  keyFilename: path.resolve(__dirname, "../play-and-swim-29fc056371c7.json"), // 可選: 指定憑證路徑
});

// 讀取並解析 CSV 文件
const readCsv = async (file) => {
  return new Promise((resolve, reject) => {
    const results = [];

    // 創建讀取 GCS 文件的 stream
    const fileStream = storage
      .bucket(BUCKET_NAME)
      .file(file.name)
      .createReadStream();

    // 使用 csv-parser 來解析 CSV 文件
    fileStream
      .pipe(csv())
      .on("data", (data) => results.push(data)) // 收集每一行數據
      .on("end", () => {
        console.log(`Parsed CSV data for file: ${file.name}`, results);
        resolve(results); // 解析完成後，返回數據
      })
      .on("error", (err) => {
        console.error(`Error reading CSV file: ${file.name}`, err);
        reject(err); // 如果發生錯誤，觸發拒絕
      });
  });
};

module.exports = readCsv;
