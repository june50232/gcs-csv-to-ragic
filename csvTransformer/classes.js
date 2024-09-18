const { normalizeInput } = require("../utils/normalizeInput");
const { extractCourse } = require("../utils/extractCourses");

function transformCSV(input) {
  // 正規化輸入，將全形字符轉換為半形
  const normalizedInput = normalizeInput(input);

  // 拆分為行數據
  const lines = normalizedInput.trim().split("\n");

  // 提取 header 並創建 header 索引對應
  const headers = lines[0].split(",").map((header) => header.trim());

  // 找到所需的 header 名稱並記錄它們的索引位置
  const headerIndex = {
    classPlan: headers.indexOf("班級方案"),
    totalClasses: headers.indexOf("堂數"),
    // 其他需要的 header 可以在這裡添加
  };

  // 提取數據行，忽略 header 行
  const data = lines.slice(1).map((line) => {
    return line
      .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      .map((val) => val.replace(/^"|"$/g, "").trim());
  });

  // 儲存處理後的數據
  const transformedData = [];

  // 使用 forEach 來遍歷數據並處理
  data.forEach((row) => {
    const data = extractCourse(row, headerIndex);

    if (data) {
      // 將結果 push 到 transformedData 數組中
      transformedData.push(data);
    }
  });

  // 將處理後的數據轉換回 CSV 格式
  return [
    Object.keys(transformedData[0]).join(","),
    ...transformedData.map((row) => Object.values(row).join(",")),
  ].join("\n");
}

module.exports = { transformCSV };
