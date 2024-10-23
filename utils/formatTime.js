function getFormattedToday(hasTime = false) {
  const today = new Date();
  const options = {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  };
  let formattedDate = today
    .toLocaleDateString("zh-TW", options)
    .replace(/\//g, "/");

  if (hasTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
    formattedDate = today
      .toLocaleString("zh-TW", options)
      .replace(/\//g, "/")
      .replace(/:/g, ":");
  }
  return formattedDate;
}

function formateYearMonthDay(dateTimeStr) {
  if (!dateTimeStr) return null;

  const dateStr = dateTimeStr.split(" ")[0];
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  return `${year}/${month + 1}/${day}`;
}

module.exports = {
  getFormattedDateTime,
  getFormattedToday,
  formateYearMonthDay,
};
