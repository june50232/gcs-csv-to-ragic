require("dotenv").config();

const Papa = require("papaparse");
const fs = require("fs");
const axios = require("axios");

const RAGIC_API_URL = process.env.RAGIC_API_URL_TEACHERS;
const RAGIC_API_KEY = process.env.RAGIC_API_KEY;
const RAGIC_TEACHERS_ID = process.env.RAGIC_TEACHERS_ID;

if (!RAGIC_API_URL || !RAGIC_API_KEY) {
  console.error("Please set RAGIC_API_URL and RAGIC_API_KEY in your .env file");
  process.exit(1);
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    Papa.parse(fileContent, {
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
      header: true,
    });
  });
}

async function searchByEmail(email) {
  try {
    const response = await axios.get(
      `${RAGIC_API_URL}?where=${RAGIC_TEACHERS_ID},eq,${encodeURIComponent(
        email
      )}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(RAGIC_API_KEY).toString(
            "base64"
          )}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching data in Ragic:", error);
    throw error;
  }
}

async function createOrUpdateInRagic(data) {
  try {
    const existingRecords = await searchByEmail(data.E - Mail);
    let response;
    if (Object.keys(existingRecords).length > 0) {
      // 記錄已存在，進行更新
      const recordId = Object.keys(existingRecords)[0];
      response = await axios.put(`${RAGIC_API_URL}/${recordId}`, data, {
        headers: {
          Authorization: `Basic ${Buffer.from(RAGIC_API_KEY).toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      });
      console.log(`Updated record for ${data.姓名}`);
    } else {
      // 記錄不存在，創建新記錄
      response = await axios.post(RAGIC_API_URL, data, {
        headers: {
          Authorization: `Basic ${Buffer.from(RAGIC_API_KEY).toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      });
      console.log(`Created new record for ${data.姓名}`);
    }
    return response.data;
  } catch (error) {
    console.error("Error creating/updating data in Ragic:", error);
    throw error;
  }
}

async function importCSVToRagic(csvFilePath) {
  try {
    const csvData = await readCSV(csvFilePath);
    for (const row of csvData) {
      const result = await createOrUpdateInRagic(row);
      console.log("Data imported:", result);
    }
    console.log("CSV import completed");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

// 使用示例
importCSVToRagic("path/to/your/file.csv");
