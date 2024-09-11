const fs = require("fs");

function parseCsv(content) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
  return data;
}

function transformCsv(inputPath, outputPath, fieldMapping) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, content) => {
      if (err) {
        reject(err);
        return;
      }

      const data = parseCsv(content);
      const transformedData = data.map((row) => {
        const transformedRow = {};
        for (const [oldField, newField] of Object.entries(fieldMapping)) {
          transformedRow[newField] = row[oldField] || "";
        }
        return transformedRow;
      });

      const outputContent = [
        Object.values(fieldMapping).join(","),
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

module.exports = { transformCsv };
