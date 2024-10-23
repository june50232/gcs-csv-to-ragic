const { normalizeInput } = require("../utils/normalizeInput");
const { getFormattedToday } = require("../utils/formatTime");

function transformCSV(input) {
  // 將輸入正規化
  const normalizedInput = normalizeInput(input);
  const lines = normalizedInput.trim().split("\n");

  // 提取表頭，根據中文名稱定位欄位
  const headers = lines[0].split(",");
  const teacherColumnIndex = headers.indexOf("授課老師");
  const emailColumnIndex = headers.indexOf("電子郵件");

  const transformedData = [];

  // 遍歷數據行，處理每一行數據
  lines.slice(1).forEach((line, index) => {
    // 使用正則表達式來處理引號內的逗號
    const row = line
      .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      .map((val) => val.replace(/^"|"$/g, "").trim());

    // 獲取授課老師欄位資訊
    const teacherInfo = row[teacherColumnIndex].match(/『(.*?)』\s*(.*?)老師/);
    if (teacherInfo && row[teacherColumnIndex] !== "") {
      const level = teacherInfo[1].trim(); // 教師等級
      const name = teacherInfo[2].trim(); // 教師姓名

      // 將轉換後的數據推入結果數組
      transformedData.push({
        3003218: row[emailColumnIndex].trim(),
        3003169: name,
        1000485: level,
        1000621: row[teacherColumnIndex].trim(),
        3003402: getFormattedToday(),
        1000551: getFormattedToday(true),
      });
    }
  });

  return transformedData;
}

module.exports = { transformCSV };
