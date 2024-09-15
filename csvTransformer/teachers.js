const { normalizeInput } = require("../utils/normalizeInput");

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
      const level = teacherInfo[1]; // 教師等級
      const name = teacherInfo[2]; // 教師姓名

      // 將轉換後的數據推入結果數組
      transformedData.push({
        索引: index + 1,
        老師姓名: name,
        教師等級: level,
        "E-Mail": row[emailColumnIndex],
        類別: "",
        老師編號: "",
        備註: row[teacherColumnIndex],
      });
    }
  });

  // 構建 CSV 格式的結果
  const resultCSV = [
    Object.keys(transformedData[0]).join(","),
    ...transformedData.map((row) => Object.values(row).join(",")),
  ].join("\n");

  return resultCSV;
}

module.exports = { transformCSV };
