const { normalizeInput } = require("../utils/normalizeInput");

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

  const outputHeader =
    "學員識別,學員姓名,學員編號,學員小名/暱稱,性別,E-Mail,電話,生日,說明";
  const output = [outputHeader];

  const processLine = (line) => {
    const lineParts = line.split(",");
    const studentInfo = lineParts[idxMapping.studentInfo] || ""; // 學員家長 info
    const email = lineParts[idxMapping.email] || ""; // 電子郵件
    const phone = lineParts[idxMapping.phone] || ""; // 電話
    const customID = lineParts[idxMapping.customID] || ""; // 自訂ID, used as birthday
    // Updated phone formatting logic to remove non-numeric characters
    const formatPhone = phone.replace(/[^\d]/g, ""); // Remove all non-numeric characters

    // Skip the line if studentInfo does not contain "/"
    if (!studentInfo.includes("/")) {
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
      const outputLine = [
        formattedName + " " + email,
        formattedName,
        "", // 學員編號 (empty in the output)
        nickname.trim(),
        gender.trim(),
        email,
        formatPhone,
        birthday,
        studentInfo + " " + customID,
      ].join(",");
      output.push(outputLine);
    });
  };

  // Process all lines, skipping the header
  for (let i = 1; i < lines.length; i++) {
    processLine(lines[i]);
  }

  return output.join("\n");
};

module.exports = { transformCSV };
