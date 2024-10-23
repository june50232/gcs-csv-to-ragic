const { normalizeInput } = require("../utils/normalizeInput");
const { extractCourse } = require("../utils/courses");

function transformCSV(input) {
  const normalizedInput = normalizeInput(input);
  const lines = normalizedInput.trim().split("\n");

  // Parse header line to find column indices
  const headers = lines[0].split(",");
  const headerIndex = {
    classPlan: headers.indexOf("班級方案"),
    totalClasses: headers.indexOf("堂數"),
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

  return transformedData;
}

module.exports = { transformCSV };
