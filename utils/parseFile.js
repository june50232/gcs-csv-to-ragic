const fs = require("fs");

function parseFile(inputPath, outputPath, transformCSVFn) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, content) => {
      if (err) {
        console.error("讀取檔案錯誤:", err);
        reject(err);
        return;
      }

      const outputContent = transformCSVFn(content);

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

module.exports = { parseFile };
