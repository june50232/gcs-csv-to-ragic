const { extractCourse } = require("../utils/courses");

const transformCSV = (input) => {
  const transformedData = [];

  const processRow = (row) => {
    // 提取課程資料
    const courseData = extractCourse(row);
    return courseData;
  };

  // 處理每一行數據，input 已經是物件陣列
  input.forEach((row) => {
    processRow(row); // 逐行處理
  });

  return transformedData;
};

module.exports = transformCSV;
