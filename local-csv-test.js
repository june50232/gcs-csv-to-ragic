const { transformCsv } = require("./csvTransformer");

// 定義欄位映射
const fieldMapping = {
  OldTeacherName: "Name",
  OldSubject: "Subject",
  OldEmail: "Email",
  // 添加更多欄位映射...
};

// 執行轉換
transformCsv("input.csv", "output.csv", fieldMapping)
  .then(() => {
    console.log("CSV 轉換完成");
  })
  .catch((error) => {
    console.error("CSV 轉換錯誤:", error);
  });
