import { detectStorage } from "../utils/detectStorage";

const detectOrdersCSV = () => {
  // 執行檔案檢查
  const csvFiles = detectStorage("orders");
  return csvFiles;
};

export default detectOrdersCSV;
