const fs = require("fs");

function transformCsvTeachers(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, content) => {
      if (err) {
        console.error("讀取檔案錯誤:", err);
        reject(err);
        return;
      }

      const lines = content.trim().split("\n");
      const data = lines.slice(1).map((line) => {
        // 使用正則表達式來處理引號內的逗號
        return line
          .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
          .map((val) => val.replace(/^"|"$/g, "").trim());
      });

      const transformedData = data
        .filter((row) => {
          const teacherInfo = row[1].match(/『(.*?)』\s*(.*?)老師/);
          return row[1] !== "" && teacherInfo !== null;
        })
        .map((row, index) => {
          const teacherInfo = row[1].match(/『(.*?)』\s*(.*?)老師/);
          const level = teacherInfo[1];
          const name = teacherInfo[2];

          return {
            索引: index + 1,
            老師姓名: name,
            教師等級: level,
            "E-Mail": row[2],
            類別: "",
            老師編號: "",
          };
        });

      const outputContent = [
        Object.keys(transformedData[0]).join(","),
        ...transformedData.map((row) => Object.values(row).join(",")),
      ].join("\n");

      fs.writeFile(outputPath, outputContent, "utf8", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

module.exports = { transformCsvTeachers };
