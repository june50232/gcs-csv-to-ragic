const { normalizeInput } = require("../utils/normalizeInput");
const { getFormattedToday } = require("../utils/formatTime");

const transformCSV = (input) => {
  const normalizedInput = normalizeInput(input);
  const lines = normalizedInput.trim().split("\n");

  // Parse header line to find column indices
  const header = lines[0].split(",");
  const idxMapping = {
    studentInfo: header.indexOf("學員家長"),
    email: header.indexOf("電子郵件"),
    phone: header.indexOf("電話"),
    customID: header.indexOf("自訂ID"), // We'll treat this as the birthday field
  };

  let result = [];

  const processLine = (line) => {
    const lineParts = line.split(",");
    const studentInfo = lineParts[idxMapping.studentInfo] || ""; // 學員家長 info
    const email = lineParts[idxMapping.email] || ""; // 電子郵件
    const phone = lineParts[idxMapping.phone] || ""; // 電話
    const customID = lineParts[idxMapping.customID] || ""; // 自訂ID, used as birthday
    // Updated phone formatting logic to remove non-numeric characters
    let formatPhone = phone.replace(/[^\d]/g, ""); // Remove all non-numeric characters
    // 檢查電話號碼是否為 9 碼且開頭為 9
    if (formatPhone.length === 9 && formatPhone.startsWith("9")) {
      // 在開頭補 0
      formatPhone = "0" + formatPhone;
    }

    // Skip the line if studentInfo does not contain "/"
    if (!studentInfo.includes("/") || studentInfo.split("/").length < 3) {
      return;
    }
    const cleanedStudentInfo = studentInfo.replace(/^["']|["']$/g, "");
    // First split by & or ＆ to handle multiple students
    const multipleStudents = cleanedStudentInfo
      .split(/&|＆/)
      .map((s) => s.trim());
    const multipleBirthdays = customID.split(/&|＆/).map((b) => b.trim());

    multipleStudents.forEach((student, index) => {
      // Split each student by "/"
      const [name = "", nickname = "", gender = ""] = student.split("/");

      // Remove invalid characters from the name
      const formattedName = name.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").trim();

      // Get the corresponding birthday or an empty string if not available
      const birthday = multipleBirthdays[index] || "";
      // Output line
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
      result.push(outputLine);
    });
  };

  // Process all lines, skipping the header
  for (let i = 1; i < lines.length; i++) {
    processLine(lines[i]);
  }

  return result;
};

module.exports = { transformCSV };
