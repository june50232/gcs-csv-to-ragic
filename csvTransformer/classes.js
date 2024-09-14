const fs = require("fs");

// 輸入字串正規化函數
function normalizeInput(str) {
  // 替換全形字符為半形字符
  str = str.replace(/[\uFF01-\uFF5E]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
  });

  // 替換全形空格為半形空格
  str = str.replace(/\u3000/g, " ");

  // 移除不可見字符，例如零寬字符
  str = str.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 將各種破折號和波浪號替換為標準的 '-'
  str = str.replace(
    /[\u2013-\u2015\u2212\uFE63\uFF0D\u2010-\u2012\uFF5E\u301C\u223C\u2015\u2500\uFF0D－–—―～〜﹣]/g,
    "-"
  );

  return str;
}

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
  // 尝试匹配括号内的日期范围
  const dateRangeRegex = /\((\d{1,2}\/\d{1,2})~(\d{1,2}\/\d{1,2})/;
  const dateRangeMatch = str.match(dateRangeRegex);

  if (dateRangeMatch) {
    // 如果找到日期范围，提取 startDate 和 endDate
    return {
      startDate: dateRangeMatch[1],
      endDate: dateRangeMatch[2],
    };
  } else {
    // 如果没有找到日期范围，移除括号内的内容
    const strNoParentheses = str.replace(/\(.*?\)/g, "");
    // 匹配第一个出现的日期
    const dateRegex = /(\d{1,2}\/\d{1,2})/;
    const dateMatch = strNoParentheses.match(dateRegex);

    if (dateMatch) {
      // 如果找到日期，startDate 和 endDate 相同
      return {
        startDate: dateMatch[1],
        endDate: dateMatch[1],
      };
    } else {
      // 如果未找到任何日期，返回空字符串
      return {
        startDate: "",
        endDate: "",
      };
    }
  }
}

function transformCsvClasses(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, content) => {
      if (err) {
        console.error("讀取檔案錯誤:", err);
        reject(err);
        return;
      }

      const lines = content.trim().split("\n");
      const data = lines.slice(1).map((line) => {
        return line
          .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
          .map((val) => val.replace(/^"|"$/g, "").trim());
      });

      const transformedData = data
        .filter((row) => {
          const courseInfo = row[1].match(/『(.+?)』(.+)/);
          return !!courseInfo;
        })
        .map((row, index) => {
          const courseInfo = row[1].match(/『(.+?)』(.+)/);
          const fullCourseName = normalizeInput(courseInfo[0]);
          const courseName = extractCourseName(fullCourseName);
          const courseType = extractCourseType(fullCourseName);
          const courseLabel = courseInfo[1];
          const courseDetails = courseInfo[2];
          console.log({ fullCourseName, courseName, courseType });
          let teacherName = "";
          let startTime = "";
          let endTime = "";
          let dayOfWeek = "";

          // 提取时间信息
          const timeMatch = courseDetails.match(
            /(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/
          );
          if (timeMatch) {
            startTime = timeMatch[1];
            endTime = timeMatch[2];
          }

          // 提取星期几
          const dayMatch = courseDetails.match(/週(一|二|三|四|五|六|日)/);
          if (dayMatch) {
            dayOfWeek = dayMatch[1];
          }

          // 提取日期
          const { startDate, endDate } = extractDates(courseDetails);

          // 提取教师姓名
          const teacherMatch = courseDetails.match(
            /-([\u4e00-\u9fa5A-Za-z\s]+)老師/
          );
          if (teacherMatch) {
            teacherName = teacherMatch[1];
          }

          // 计算单堂时数
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
            商品標籛: courseLabel,
            授課老師編號: "",
            授課老師姓名: teacherName,
            課程類別: courseType,
            總堂數: row[3],
            備註: courseInfo[0],
          };
        })
        .filter((row) => row !== null);

      const outputContent = [
        Object.keys(transformedData[0]).join(","),
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

module.exports = { transformCsvClasses };
