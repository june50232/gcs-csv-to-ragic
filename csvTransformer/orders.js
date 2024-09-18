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
  const idxMapping = {
    orderDate: headers.indexOf("購買日期"),
    classPlan: headers.indexOf("品項"),
    studentInfo: headers.indexOf("學員家長"),
    totalDollars: headers.indexOf("總計"),
    // 其他需要的 header 可以在這裡添加
  };

  function formatDate(dateTimeStr) {
    if (!dateTimeStr) return "";
    // 分割日期和時間
    const [datePart] = dateTimeStr.split(" ");

    // 將日期部分的 "-" 替換為 "/"
    const formattedDate = datePart.replace(/-/g, "/");

    return formattedDate;
  }

  // 儲存處理後的數據
  const transformedData = [];
  const processRow = (row) => {
    const orderDate = formatDate(row[idxMapping.orderDate]); // 學員家長 info
    const studentInfo = row[idxMapping.studentInfo] || ""; // 學員家長 info
    const totalDollars = row[idxMapping.totalDollars] || ""; // 學員家長 info
    const courseData = extractCourse(row, idxMapping);

    if (!courseData || !studentInfo.includes("/")) {
      return;
    }
    const cleanedStudentInfo = studentInfo.replace(/^["']|["']$/g, "");
    const multipleStudents = cleanedStudentInfo
      .split(/&|＆/)
      .map((s) => s.trim());

    multipleStudents.forEach((student) => {
      // Split each student by "/"
      const [name = "", nickname = "", gender = ""] = student.split("/");

      // Remove invalid characters from the name
      const formattedName = name.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "");

      // 將結果 push 到 transformedData 數組中
      transformedData.push({
        訂單識別:
          formattedName +
          " " +
          orderDate +
          " " +
          courseData.課程識別 +
          " " +
          totalDollars,
        訂購編號: "",
        訂購日期: orderDate,
        訂購人: formattedName,
        "學員小名/暱稱": nickname,
        學員性別: gender,
        學員備註: studentInfo,
        ...courseData,
        授課老師編號: "",
        學期金額: totalDollars,
      });
    });
  };
  // Process all lines, skipping the header
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((col) => col.trim());
    processRow(row);
  }

  // 將處理後的數據轉換回 CSV 格式
  const csvHeaders = Object.keys(transformedData[0]).join(",");
  const csvRows = transformedData.map((row) =>
    Object.values(row)
      .map((value) => `"${value}"`) // 加上引號處理包含逗號的數據
      .join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

module.exports = { transformCSV };
