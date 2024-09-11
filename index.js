require("dotenv").config();

const express = require("express");
const { Storage } = require("@google-cloud/storage");
const csv = require("csv-parser");
const axios = require("axios");
const stream = require("stream");
const { promisify } = require("util");

const app = express();
const storage = new Storage();
const pipeline = promisify(stream.pipeline);

// 欄位映射配置
const fieldMapping = {
  TeacherName: "Name",
  Subject: "Subject",
  Email: "Email",
  // ... 添加更多欄位映射
};

// Ragic API配置
const ragicConfig = {
  apiUrl: process.env.RAGIC_API_URL,
  apiKey: process.env.RAGIC_API_KEY,
};

app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const { bucket, name } = req.body;
    console.log(`Processing file: gs://${bucket}/${name}`);

    const records = await parseCSVFromGCS(bucket, name);
    await processRecords(records);

    res.status(200).send("File processed successfully");
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
});

async function parseCSVFromGCS(bucketName, fileName) {
  const results = [];
  const readStream = storage
    .bucket(bucketName)
    .file(fileName)
    .createReadStream();

  await pipeline(
    readStream,
    csv(),
    new stream.Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        const processedRow = {};
        for (const [oldField, newField] of Object.entries(fieldMapping)) {
          processedRow[newField] = chunk[oldField] || "";
        }
        results.push(processedRow);
        callback();
      },
    })
  );

  return results;
}

async function processRecords(records) {
  for (const record of records) {
    try {
      const existingRecord = await checkExistingRecord(record.Name);
      if (existingRecord) {
        await updateRecord(existingRecord._ragicId, record);
      } else {
        await createRecord(record);
      }
    } catch (error) {
      console.error("Error processing record:", error.message);
    }
  }
}

async function checkExistingRecord(teacherName) {
  try {
    const response = await axios.get(
      `${ragicConfig.apiUrl}?q=${encodeURIComponent(teacherName)}`,
      {
        headers: { Authorization: `Bearer ${ragicConfig.apiKey}` },
      }
    );
    const records = response.data;
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error("Error checking existing record:", error.message);
    throw error;
  }
}

async function createRecord(record) {
  try {
    const response = await axios.post(ragicConfig.apiUrl, record, {
      headers: {
        Authorization: `Bearer ${ragicConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    console.log("New record created:", response.data);
  } catch (error) {
    console.error("Error creating record:", error.message);
    throw error;
  }
}

async function updateRecord(recordId, record) {
  try {
    const response = await axios.post(
      `${ragicConfig.apiUrl}/${recordId}`,
      record,
      {
        headers: {
          Authorization: `Bearer ${ragicConfig.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Record updated:", response.data);
  } catch (error) {
    console.error("Error updating record:", error.message);
    throw error;
  }
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
