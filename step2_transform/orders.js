const { extractCourse } = require("../utils/courses_usedBy_orders");
const {
  getFormattedToday,
  formateYearMonthDay,
} = require("../utils/formatTime");

const transformCSV = (input) => {
  const transformedData = [];

  const processRow = (row) => {
    const orderDate = formateYearMonthDay(row["購買日期"]);
    const studentInfo = row["學員家長"] || "";
    const totalDollars = row["總計"] || "";
    const classPlan = row["品項"] || "";

    let courseData = null;
    // 提取課程資料
    if (classPlan) {
      courseData = extractCourse(row);
    }

    // 檢查資料是否有效，並確保 "學員家長" 欄位中有 "/"
    if (!courseData || !studentInfo.includes("/")) {
      return;
    }

    // 清理 "學員家長" 資訊，並處理多位學員
    const cleanedStudentInfo = studentInfo.replace(/^["']|["']$/g, "");
    const multipleStudents = cleanedStudentInfo
      .split(/&|＆/)
      .map((s) => s.trim());

    multipleStudents.forEach((student) => {
      // 根據 "/" 分割學員姓名、暱稱和性別
      const [name = "", nickname = "", gender = ""] = student.split("/");

      // 移除姓名中的無效字符（非中文或英文字符）
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
        3003221: orderDate, // 購買日期
        1000419: formattedName, // 姓名
        3003224: nickname.trim(), // 暱稱
        1000427: gender.trim(), // 性別
        1000524: studentInfo.trim(), // 學員家長原始資料
        ...courseData, // 課程資料
        1000420: totalDollars, // 總計金額
        1000523: classPlan.trim(), // 品項（課程名稱）
        1000554: getFormattedToday(true), // 當天日期
        1000527: formattedName + " " + nickname.trim() + " " + gender.trim(), // 組合的學員資料
      });
    });
  };

  // 處理每一行數據，input 已經是物件陣列
  input.forEach((row) => {
    processRow(row); // 逐行處理
  });

  return transformedData;
};

module.exports = transformCSV;
