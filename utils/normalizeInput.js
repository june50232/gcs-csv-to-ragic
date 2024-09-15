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

  // 移除兩個逗號之間的空字符串 (例如: ,"", -> ,,)
  str = str.replace(/,"",/g, ",,");

  // 移除包含內容的引號，例如 ,"2024-08-27 14:15", -> ,2024-08-27 14:15,
  str = str.replace(/,"(.*?)",/g, ",$1,"); // Remove quotes around values

  // 移除行尾的引號 (以防止在最後一個欄位被包裹在引號中)
  str = str.replace(/,"(.*?)"$/g, ",$1"); // Remove quotes at the end of the line

  return str;
}

module.exports = { normalizeInput };
