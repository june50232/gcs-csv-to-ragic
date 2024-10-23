import { detectStorage } from "../utils/detectStorage";

const detectTeachersCSV = () => {
  // 執行檔案檢查
  const csvFiles = detectStorage("teachers");
  return csvFiles;
};

export default detectTeachersCSV;
