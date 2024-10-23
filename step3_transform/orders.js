const { normalizeInput } = require("../utils/normalizeInput");
const { extractCourse } = require("../utils/courses");
const {
  getFormattedToday,
  formateYearMonthDay,
} = require("../utils/formatTime");

function transformCSV(input) {
  const normalizedInput = normalizeInput(input);
  const lines = normalizedInput.trim().split("\n");

  // Parse header line to find column indices
  const headers = lines[0].split(",");
  const idxMapping = {
    orderDate: headers.indexOf("購買日期"),
    classPlan: headers.indexOf("品項"),
    studentInfo: headers.indexOf("學員家長"),
    totalDollars: headers.indexOf("總計"),
    // 其他需要的 header 可以在這裡添加
  };

  const transformedData = [];
  const processRow = (row) => {
    const orderDate = formateYearMonthDay(row[idxMapping.orderDate]);
    const studentInfo = row[idxMapping.studentInfo] || "";
    const totalDollars = row[idxMapping.totalDollars] || "";
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
      const formattedName = name.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").trim();

      // 將結果 push 到 transformedData 數組中
      transformedData.push({
        1000515:
          formattedName +
          " " +
          orderDate +
          " " +
          courseData[1000516] +
          " " +
          totalDollars,
        3003221: orderDate,
        1000419: formattedName,
        3003224: nickname.trim(),
        1000427: gender.trim(),
        1000524: studentInfo.trim(),
        ...courseData,
        1000420: totalDollars,
        1000523: row[idxMapping.classPlan].trim() || "",
        1000554: getFormattedToday(true),
        1000527: formattedName + " " + nickname.trim() + " " + gender.trim(),
      });
    });
  };

  // Process all lines, skipping the header
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((col) => col.trim());
    processRow(row);
  }

  return transformedData;
}

module.exports = { transformCSV };
