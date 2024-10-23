const { getFormattedToday } = require("../utils/formatTime");

const transformCSV = (input) => {
  const transformedData = [];

  input.forEach((row) => {
    // 直接從已經解析好的物件中提取 "授課老師" 和 "電子郵件" 欄位
    const teacherInfo = row["授課老師"] || "";
    const email = row["電子郵件"] || "";

    // 使用正則表達式來解析 "授課老師" 欄位中的教師等級和姓名
    const teacherMatch = teacherInfo.match(/『(.*?)』\s*(.*?)老師/);
    if (teacherMatch && teacherInfo !== "") {
      const level = teacherMatch[1].trim(); // 教師等級
      const name = teacherMatch[2].trim(); // 教師姓名

      // 將轉換後的數據推入結果數組
      transformedData.push({
        3003218: email.trim(), // 電子郵件
        3003169: name, // 教師姓名
        1000485: level, // 教師等級
        1000621: teacherInfo.trim(), // 授課老師原始資訊
        3003402: getFormattedToday(), // 當天日期
        1000551: getFormattedToday(true), // 當天日期（其他格式）
      });
    }
  });

  return transformedData;
};



module.exports = transformCSV;
