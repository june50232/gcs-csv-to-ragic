const fs = require("fs");
const { normalizeInput } = require("../normalizeInput");

const transformCSV = (input) => {
  const normalizedInput = normalizeInput(input);
  const lines = normalizedInput.trim().split("\n");
  const header =
    "索引,學員編號,學員小名/暱稱,學生姓名,性別,E-Mail,電話,生日,備註";
  const output = [header];

  const processLine = (line) => {
    const lineParts = line.split(",");
    const studentInfo = lineParts[1] || ""; // 學員家長 info
    const email = lineParts[2] || ""; // 電子郵件
    const phone = lineParts[3] || ""; // 電話
    // Updated phone formatting logic to remove non-numeric characters
    const formatPhone = phone.replace(/[^\d]/g, ""); // Remove all non-numeric characters

    const birthday = lineParts[lineParts.length - 1].replace(/"/g, "") || ""; // 生日

    // Skip the line if studentInfo does not contain "/"
    if (!studentInfo.includes("/")) {
      return;
    }

    // First split by & or ＆ to handle multiple students
    const multipleStudents = studentInfo.split(/&|＆/).map((s) => s.trim());

    multipleStudents.forEach((student) => {
      // Split each student by "/"
      const [name = "", nickname = "", gender = ""] = student.split("/");

      // Remove invalid characters from the name
      const formattedName = name.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "");

      // Output line
      const outputLine = [
        output.length,
        "", // 學員編號 (empty in the output)
        nickname.trim(),
        formattedName.trim(),
        gender.trim(),
        email,
        formatPhone,
        birthday,
        studentInfo,
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

function transformCsvStudents(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, content) => {
      if (err) {
        console.error("讀取檔案錯誤:", err);
        reject(err);
        return;
      }

      const transformedContent = transformCSV(content);

      fs.writeFile(outputPath, transformedContent, "utf8", (writeErr) => {
        if (writeErr) {
          console.error("寫入檔案錯誤:", writeErr);
          reject(writeErr);
          return;
        }
        console.log("轉換完成。請檢查 " + outputPath + " 查看結果。");
        resolve();
      });
    });
  });
}
module.exports = { transformCsvStudents };
