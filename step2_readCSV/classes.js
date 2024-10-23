import { detectStorage } from "../utils/detectStorage";

const detectClassesCSV = () => {
  // 執行檔案檢查
  const csvFiles = detectStorage("classes");
  return csvFiles;
};

export default detectClassesCSV;
