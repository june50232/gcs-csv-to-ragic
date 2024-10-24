const { getFormattedToday } = require("./formatTime");

// 定義不同類別的 courseTypes
const courseTypesStandard = [
  "漂漂班 0~5M",
  "寶寶班 5~12M",
  "幼幼班 1~2Y",
  "幼童班 2~3Y",
  "小童班 3~4Y",
  "大童班 4Y以上",
];

function parentKidCourseType(input) {
  let courseType = "";

  const levelPattern = /(漂漂|寶寶|幼幼|幼童|小童|大童)/;
  const levelMatch = input.match(levelPattern);

  if (levelMatch) {
    const targetLevel = levelMatch[1];
    courseType +=
      courseTypesStandard.find((ct) => ct.includes(targetLevel)) || "";
  }

  return courseType;
}

// 提取課程類型的函數
function extractCourseType(input) {
  let courseType = "";

  // 檢查字串中是否包含 "Aqua"
  const containsAqua = input.toLowerCase().includes("aqua");
  const containsTechnique = input.includes("招式班");
  const containsSomeTechnique = input.includes("過渡");

  if (containsSomeTechnique) {
    courseType += "過渡";
  }
  if (containsTechnique) {
    courseType += "招式 (Aqua kids 預備班）";
  }

  courseType += parentKidCourseType(input);

  return courseType;
}

function extractCourseName(input) {
  let courseName = "";
  let courseType = "";

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

  courseType = parentKidCourseType(input);
  if (courseType) {
    courseName += courseType.split(" ")[0];
  }

  return courseName;
}

function extractDates(str) {
  const dateRangeRegex = /(\d{1,2}\/\d{1,2})\s*[-~～]\s*(\d{1,2}\/\d{1,2})/;
  const dateRangeMatch = str.match(dateRangeRegex);

  let startDate = "";
  let endDate = "";

  if (dateRangeMatch) {
    startDate = dateRangeMatch[1];
    endDate = dateRangeMatch[2];
  } else {
    const strNoParentheses = str.replace(/\(.*?\)/g, "");
    const dateRegex = /(\d{1,2}\/\d{1,2})/;
    const dateMatch = strNoParentheses.match(dateRegex);

    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = dateMatch[1];
    }
  }

  if (startDate) {
    startDate = addYearToDate(startDate);
  }
  if (endDate) {
    endDate = addYearToDate(endDate);
    if (new Date(endDate) < new Date(startDate)) {
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
  if (!dateStr) return "";

  const options = {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  if (dateStr.split("/").length === 2) {
    const [monthStr, dayStr] = dateStr.split("/");
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const today = new Date();
    const currentYear = today.getFullYear();
    const date = new Date(currentYear, month - 1, day);
    return date.toLocaleDateString("zh-TW", options).replace(/\//g, "/");
  }
}

const extractCourse = (input) => {
  const courseInfo = input["班級方案"].match(/『(.+?)』(.+)/);
  if (!courseInfo) return null;

  let data = null;

  const fullCourseName = courseInfo[0];
  const courseName = extractCourseName(fullCourseName);
  const courseType = extractCourseType(fullCourseName);
  const courseLabel = courseInfo[1];
  const courseDetails = courseInfo[2];

  let teacherName = "";
  let startTime = "";
  let endTime = "";
  let dayOfWeek = "";

  const timeMatch = courseDetails.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  if (timeMatch) {
    startTime = timeMatch[1];
    endTime = timeMatch[2];
  }

  const dayMatch = courseDetails.match(/週(一|二|三|四|五|六|日)/);
  if (dayMatch) {
    dayOfWeek = dayMatch[1];
  }

  const { startDate, endDate } = extractDates(courseDetails);

  const teacherMatch = courseDetails.match(/-([\u4e00-\u9fa5A-Za-z\s]+)老師/);
  if (teacherMatch) {
    teacherName = teacherMatch[1].trim();
  }

  let duration = "";
  if (startTime && endTime) {
    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);
    duration = (end[0] + end[1] / 60 - (start[0] + start[1] / 60)).toFixed(2);
  }

  data = {
    1000516:
      courseLabel +
      " " +
      courseName +
      " " +
      courseType +
      (teacherName ? " " + teacherName : "") +
      (startDate ? " " + startDate : "") +
      (startTime ? " " + startTime : ""),
    3003183:
      courseLabel + " " + courseName + (teacherName ? " " + teacherName : ""),
    3003193: startDate,
    3003194: endDate,
    3003189: startTime,
    3003190: endTime,
    3003186: dayOfWeek,
    3003187: duration,
    1000415: courseLabel,
    3003227: teacherName,
    1000479: courseType,
    3003188: input["課程 / 點數"] || "",
    1000514: courseInfo[0],
    1000522: getFormattedToday(),
    1000553: getFormattedToday(true),
  };
  return data;
};

module.exports = extractCourse;
