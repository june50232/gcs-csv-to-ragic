const { normalizeInput } = require("../utils/normalizeInput");

// 前綴映射函數
function mapPrefix(input, prefixMappings) {
  for (let [inputPrefix, mapped] of Object.entries(prefixMappings)) {
    if (input.includes(inputPrefix)) {
      return mapped;
    }
  }
  return "";
}

// 提取課程名稱的函數
function extractCourseName(input) {
  const courseNames = [
    "親子共遊漂漂班",
    "親子共遊寶寶班",
    "親子共遊幼幼班",
    "親子共遊幼童班",
    "親子共遊小童班",
    "親子共遊大童班",
    "過度招式班",
    "招式班",
    "Aqua Kids",
    "親子共遊體驗課漂漂班",
    "親子共遊體驗課寶寶班",
    "親子共遊體驗課幼幼班",
    "親子共遊體驗課幼童班",
    "親子共遊體驗課小童班",
    "親子共遊體驗課大童班",
    "體驗課過度招式班",
    "體驗課招式班",
    "體驗課Aqua Kids",
    "親子共遊慈善體驗課漂漂班",
    "親子共遊慈善體驗課寶寶班",
    "親子共遊慈善體驗課幼幼班",
    "親子共遊慈善體驗課幼童班",
    "親子共遊慈善體驗課小童班",
    "親子共遊慈善體驗課大童班",
    "慈善體驗課過度招式班",
    "慈善體驗課招式班",
    "慈善體驗課Aqua Kids",
  ];

  const prefixMappings = {
    "『親子游泳體驗課』": "親子共遊體驗課",
    "『學期課程』": "親子共遊",
    "『慈善體驗課』": "親子共遊慈善體驗課",
    "『游泳體驗課』": "體驗課",
    "『慈善體驗課』": "慈善體驗課",
  };

  let mappedPrefix = mapPrefix(input, prefixMappings);

  // 提取課程名稱
  const classNamePattern =
    /(漂漂班|寶寶班|幼幼班|幼童班|小童班|大童班|過度招式班|招式班|Aqua Kids)/;
  const classNameMatch = input.match(classNamePattern);
  let className = classNameMatch ? classNameMatch[1] : "";

  let courseName = "";

  // 構建 courseName
  if (className === "Aqua Kids") {
    if (input.includes("體驗課")) {
      courseName = mappedPrefix
        ? mappedPrefix + className
        : "體驗課" + className;
    } else if (input.includes("慈善體驗課")) {
      courseName = "慈善體驗課" + className;
    } else {
      courseName = mappedPrefix + className;
    }
  } else if (mappedPrefix && className) {
    courseName = mappedPrefix + className;
  } else if (className) {
    courseName = className;
  }

  // 確保 courseName 在列表中
  if (!courseNames.includes(courseName)) {
    for (let name of courseNames) {
      if (name.endsWith(className) && name.startsWith(mappedPrefix)) {
        courseName = name;
        break;
      }
    }
  }

  return courseName;
}

// 提取課程類型的函數
function extractCourseType(input) {
  // 正規化輸入字串
  input = normalizeInput(input);

  // 定義不同類別的 courseTypes
  const courseTypesStandard = [
    "漂漂班 0~5m",
    "寶寶班 5~12m",
    "幼幼班 1~2y",
    "幼童班 2~3y",
    "小童班 3~4y",
    "大童班 4y以上",
    "大童班 3~5y",
  ];

  const courseTypesTechnique = ["過度招式班", "招式班"];

  const courseTypesAqua = [
    "Aqua Kids 5~10y",
    "Aqua Kids 5~7y",
    "Aqua Kids 8~10y",
  ];

  let courseType = "";

  // 檢查字串中是否包含 "招式" 或 "Aqua"
  const containsTechnique = input.includes("招式");
  const containsAqua = input.toLowerCase().includes("aqua");

  // 使用您提供的 ageRangePattern
  const ageRangePattern =
    /((?:0|[1-9]|1[0-2])-(?:0|[1-9]|1[0-2])個?月|(?:[0-9]|[1-9][0-9])(?:-(?:[0-9]|[1-9][0-9]))?歲|4歲以上|Aqua Kids(?:\s+(?:5-(?:7|10)|8-10)歲)?)/;

  if (containsTechnique) {
    // 如果包含 "招式"，courseType 為 "過度招式班" 或 "招式班"
    courseType = courseTypesTechnique.find((ct) => input.includes(ct)) || "";
  } else {
    let ageRangeMatch = input.match(ageRangePattern);
    let ageRange = "";

    if (ageRangeMatch) {
      ageRange = ageRangeMatch[1];

      // 標準化 ageRange
      if (ageRange.includes("個月")) {
        ageRange = ageRange.replace("個月", "").replace("-", "~") + "m";
      } else if (ageRange.includes("歲")) {
        ageRange = ageRange.replace("歲", "").replace("-", "~") + "y";
      } else if (ageRange === "4歲以上") {
        ageRange = "4y以上";
      }
      if (containsAqua) {
        // 如果包含 "Aqua"，根據年齡範圍匹配對應的 courseType
        courseType =
          courseTypesAqua.find((ct) => ct.includes(ageRange)) ||
          "Aqua Kids 5~10y";
      } else {
        // 直接根據 ageRange 匹配 courseType
        courseType =
          courseTypesStandard.find((ct) => ct.includes(ageRange)) || "";
      }
    }
  }

  return courseType;
}

function extractDates(str) {
  // 嘗試匹配括號內的日期範圍
  const dateRangeRegex = /\((\d{1,2}\/\d{1,2})~(\d{1,2}\/\d{1,2})/;
  const dateRangeMatch = str.match(dateRangeRegex);

  let startDate = "";
  let endDate = "";

  if (dateRangeMatch) {
    // 如果找到日期範圍，提取 startDate 和 endDate
    startDate = dateRangeMatch[1];
    endDate = dateRangeMatch[2];
  } else {
    // 如果沒有找到日期範圍，移除括號內的內容
    const strNoParentheses = str.replace(/\(.*?\)/g, "");
    // 匹配第一個出現的日期
    const dateRegex = /(\d{1,2}\/\d{1,2})/;
    const dateMatch = strNoParentheses.match(dateRegex);

    if (dateMatch) {
      // 如果找到日期，startDate 和 endDate 相同
      startDate = dateMatch[1];
      endDate = dateMatch[1];
    } else {
      // 如果未找到任何日期，返回空字串
      startDate = "";
      endDate = "";
    }
  }

  // 添加年份邏輯
  if (startDate) {
    startDate = addYearToDate(startDate);
  }
  if (endDate) {
    endDate = addYearToDate(endDate);
    // 確保 endDate 不早於 startDate
    if (new Date(endDate) < new Date(startDate)) {
      // 如果 endDate 早於 startDate，將 endDate 的年份加 1
      const [year, month, day] = endDate.split("/").map(Number);
      endDate = `${year + 1}/${month}/${day}`;
    }
  }

  return {
    startDate: startDate,
    endDate: endDate,
  };
}

function addYearToDate(dateStr) {
  // dateStr 格式為 "M/D"
  const [monthStr, dayStr] = dateStr.split("/");
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() 返回 0-11，需加 1
  const fourMonthsAgo = new Date(today.setMonth(today.getMonth() - 4)); // 前四個月

  let year = currentYear;

  // 判斷 startDate 是否早於前四個月
  const dateToCheck = new Date(currentYear, month - 1, day); // month - 1 因為 JavaScript 的月份從 0 開始
  if (dateToCheck < fourMonthsAgo) {
    // 早於前四個月，年份設為下一年
    year += 1;
  }

  return `${year}/${month}/${day}`;
}

function transformCSV(input) {
  // 正規化輸入，將全形字符轉換為半形
  const normalizedInput = normalizeInput(input);

  // 拆分為行數據
  const lines = normalizedInput.trim().split("\n");

  // 提取 header 並創建 header 索引對應
  const headers = lines[0].split(",").map((header) => header.trim());

  // 找到所需的 header 名稱並記錄它們的索引位置
  const headerIndex = {
    classPlan: headers.indexOf("班級方案"),
    totalClasses: headers.indexOf("堂數"),
    // 其他需要的 header 可以在這裡添加
  };

  // 提取數據行，忽略 header 行
  const data = lines.slice(1).map((line) => {
    return line
      .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      .map((val) => val.replace(/^"|"$/g, "").trim());
  });

  // 遍歷每一行數據，處理並轉換
  const transformedData = data
    .filter((row) => {
      const courseInfo = row[headerIndex.classPlan]?.match(/『(.+?)』(.+)/);
      return !!courseInfo;
    })
    .map((row, index) => {
      const courseInfo = row[headerIndex.classPlan].match(/『(.+?)』(.+)/);
      const fullCourseName = normalizeInput(courseInfo[0]);
      const courseName = extractCourseName(fullCourseName);
      const courseType = extractCourseType(fullCourseName);
      const courseLabel = courseInfo[1];
      const courseDetails = courseInfo[2];

      let teacherName = "";
      let startTime = "";
      let endTime = "";
      let dayOfWeek = "";

      // 提取時間信息
      const timeMatch = courseDetails.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
      if (timeMatch) {
        startTime = timeMatch[1];
        endTime = timeMatch[2];
      }

      // 提取星期幾
      const dayMatch = courseDetails.match(/週(一|二|三|四|五|六|日)/);
      if (dayMatch) {
        dayOfWeek = dayMatch[1];
      }

      // 提取日期
      const { startDate, endDate } = extractDates(courseDetails);

      // 提取教師姓名
      const teacherMatch = courseDetails.match(
        /-([\u4e00-\u9fa5A-Za-z\s]+)老師/
      );
      if (teacherMatch) {
        teacherName = teacherMatch[1];
      }

      // 計算單堂時數
      let duration = "";
      if (startTime && endTime) {
        const start = startTime.split(":").map(Number);
        const end = endTime.split(":").map(Number);
        const durationMinutes =
          end[0] * 60 + end[1] - (start[0] * 60 + start[1]);
        duration = durationMinutes + "分鐘";
      }

      return {
        索引: index + 1,
        課程名稱: courseName,
        課程開始日期: startDate,
        課程結束日期: endDate,
        上課時間: startTime,
        下課時間: endTime,
        星期幾: dayOfWeek,
        單堂時數: duration,
        商品標籤: courseLabel,
        授課老師編號: "",
        授課老師姓名: teacherName,
        課程類別: courseType,
        總堂數: row[headerIndex.totalClasses], // 使用 "堂數" 對應的索引
        備註: courseInfo[0],
      };
    })
    .filter((row) => row !== null);

  // 將處理後的數據轉換回 CSV 格式
  return [
    Object.keys(transformedData[0]).join(","),
    ...transformedData.map((row) => Object.values(row).join(",")),
  ].join("\n");
}

module.exports = { transformCSV };
