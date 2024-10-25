const { getFormattedToday } = require("../utils/formatTime");

const transformCSV = (input) => {
  let result = [];

  const processLine = (line) => {
    const studentInfo = line["學員家長"] || ""; // 學員家長 info
    const email = line["電子郵件"] || ""; // 電子郵件
    const phone = line["電話"] || ""; // 電話
    const customID = line["自訂ID"] || ""; // 自訂ID, used as birthday

    // 清理電話號碼格式，移除非數字字符
    let formatPhone = phone.replace(/[^\d]/g, ""); // 移除所有非數字字符

    // 檢查電話號碼是否為 9 碼且開頭為 9
    if (formatPhone.length === 9 && formatPhone.startsWith("9")) {
      // 在開頭補 0
      formatPhone = "0" + formatPhone;
    }

    // 如果 studentInfo 中不包含 "/"，則跳過該行
    if (!studentInfo.includes("/") || studentInfo.split("/").length < 3) {
      return;
    }

    // 移除可能的引號
    const cleanedStudentInfo = studentInfo.replace(/^["']|["']$/g, "");

    // 使用 & 或 ＆ 處理多位學員
    const multipleStudents = cleanedStudentInfo
      .split(/&|＆/)
      .map((s) => s.trim());
    const multipleBirthdays = customID.split(/&|＆/).map((b) => b.trim());

    multipleStudents.forEach((student, index) => {
      // 依據 "/" 拆分學員資訊
      const [name = "", nickname = "", gender = ""] = student.split("/");

      // 清理名字中的無效字符（非中文或英文字母）
      const formattedName = name.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").trim();

      // 獲取對應的生日或空字符串
      const birthday = multipleBirthdays[index] || "";

      // 生成輸出結果
      const outputLine = {
        1000518:
          formattedName.trim() + " " + nickname.trim() + " " + gender.trim(),
        1000414: formattedName.trim(),
        3003197: nickname.trim(),
        3003198: gender.trim(),
        3003201: email,
        3003199: formatPhone,
        3003200: birthday,
        1000521: studentInfo + " " + customID,
        3003371: getFormattedToday(),
        1000550: getFormattedToday(true),
      };

      // 將每一個學員的資料加入結果陣列
      result.push(outputLine);
    });
  };

  // 處理每一行，input 已經是一個物件陣列，無需解析 CSV
  input.forEach(processLine);

  return result;
};

module.exports = transformCSV;
