const detectStorage = require("../utils/step1_detectStorage");
const transformCSV = require("../step2_transform/teachers");

// 將代碼放在 async 函數中，並使用 await 等待異步操作完成
const main = async () => {
  const csvData = await detectStorage("teachers"); // 確保等待 step1_storage 完成

  const transformedData = await transformCSV(csvData);
  console.log({ transformedData });
};

// 呼叫主函數
main();
