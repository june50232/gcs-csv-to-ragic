const { normalizeInput } = require("./normalizeInput");

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

const aquaKidsCourseTypes = ["5~7y", "8~10y"];

function parseAgeRange(input) {
  const ageRangePattern =
    /((?:0|[1-9]|1[0-2])-(?:0|[1-9]|1[0-2])個?月|(?:[0-9]|[1-9][0-9])(?:-(?:[0-9]|[1-9][0-9]))?歲|4歲以上|Aqua Kids(?:\s+(\d+(?:~\d+)?y))?)/;
  const ageRangeMatch = input.match(ageRangePattern);
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
  }
  return ageRange;
}

function parentKidCourseType(input) {
  const ageRange = parseAgeRange(input);

  const courseType =
    courseTypesStandard.find((ct) => ct.includes(ageRange)) || "";
  return courseType;
}

// 提取課程類型的函數
function extractCourseType(input) {
  // 正規化輸入字串
  input = normalizeInput(input);

  let courseType = "";

  // 檢查字串中是否包含 "招式" 或 "Aqua"
  const containsTechnique = input.includes("招式班");
  const containsSomeTechnique = input.includes("過度");
  const containsAqua = input.toLowerCase().includes("aqua");

  // 使用修正後的 ageRangePattern，允許 Aqua Kids 的年齡範圍為不限格式
  const ageRangePattern =
    /((?:0|[1-9]|1[0-2])-(?:0|[1-9]|1[0-2])個?月|(?:[0-9]|[1-9][0-9])(?:-(?:[0-9]|[1-9][0-9]))?歲|4歲以上|Aqua Kids(?:\s+(\d+(?:~\d+)?y))?)/;

  if (containsSomeTechnique) {
    courseType += "過度";
  }
  if (containsTechnique) {
    courseType += "招式班";
  }

  const ageRange = parseAgeRange(input);

  if (ageRange) {
    if (containsAqua) {
      if (ageRange && aquaKidsCourseTypes.includes(ageRange)) {
        courseType += "Aqua Kids " + ageRange; // 如果有年齡範圍，則拼接上去
      } else {
        courseType = "";
      }
    } else {
      courseType +=
        courseTypesStandard.find((ct) => ct.includes(ageRange)) || "";
    }
  }

  return courseType;
}

function extractCourseName(input) {
  let courseName = ""; // 用來構建 courseName 的堆疊

  // 根據 "慈善" 和 "體驗課" 決定前綴
  if (input.includes("慈善")) {
    courseName += "慈善";
  }
  if (input.includes("體驗課")) {
    courseName += "體驗課";
  }
  // 檢查字串中是否包含 "招式" 或 "Aqua"
  const containsTechnique = input.includes("招式班");
  const containsSomeTechnique = input.includes("過度");
  const containsAqua = input.toLowerCase().includes("aqua");
  if (containsSomeTechnique) {
    courseName += "過度";
  }
  if (containsTechnique) {
    courseName += "招式班";
  }
  if (containsAqua) {
    courseName += "Aqua Kids";
  }
  if (!containsTechnique && !containsAqua) {
    courseName += "親子共遊";

    courseType = parentKidCourseType(input);
    if (courseType) {
      courseName += courseType.split(" ")[0];
    }
  }

  return courseName; // 最終的 courseName
}

function extractDates(str) {
  // 嘗試匹配括號內的日期範圍
  const dateRangeRegex = /(\d{1,2}\/\d{1,2})\s*[-~～]\s*(\d{1,2}\/\d{1,2})/;
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

function formatDate(dateStr) {
  if (dateStr.split("/").length === 2) {
    const [monthStr, dayStr] = dateStr.split("/");
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const today = new Date();
    const currentYear = today.getFullYear();
    return new Date(currentYear, month - 1, day); // month - 1 因為 JavaScript 的月份從 0 開始
  } else if (dateStr.split("/").length === 3) {
    const [yearStr, monthStr, dayStr] = dateStr.split("/");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    return new Date(year, month - 1, day); // month - 1 因為 JavaScript 的月份從 0 開始
  }
}

function addYearToDate(dateStr) {
  // 更新年份並返回格式化的日期
  const finalDate = formatDate(dateStr);
  const year = finalDate.getFullYear();
  const month = finalDate.getMonth() + 1; // 取得月份（需要加 1 因為 getMonth() 是 0 基準）
  const day = finalDate.getDate(); // 取得日期

  return `${year}/${month}/${day}`;
}

const extractCourse = (input, headerIndex) => {
  const courseInfo = input[headerIndex.classPlan].match(/『(.+?)』(.+)/);
  let data = null;
  if (courseInfo) {
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
    const teacherMatch = courseDetails.match(/-([\u4e00-\u9fa5A-Za-z\s]+)老師/);
    if (teacherMatch) {
      teacherName = teacherMatch[1];
    }

    // 計算單堂時數
    let duration = "";
    if (startTime && endTime) {
      const start = startTime.split(":").map(Number);
      const end = endTime.split(":").map(Number);

      // 直接計算時間差（小時）
      duration = (end[0] + end[1] / 60 - (start[0] + start[1] / 60)).toFixed(2);
    }

    data = {
      課程識別:
        courseName +
        " " +
        courseType +
        " " +
        courseLabel +
        " " +
        teacherName +
        " " +
        startDate +
        " " +
        startTime,
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
      總堂數: input[headerIndex.totalClasses] || "", // 使用 "堂數" 對應的索引
      課程備註: courseInfo[0],
    };
    return data;
  }
};

module.exports = { extractCourse };
