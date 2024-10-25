const extractCourse = require("../utils/courses_usedBy_classes");

const transformCSV = (input) => {
  const transformedData = [];

  input.forEach((row) => {
    const courseData = extractCourse(row);
    if (courseData) {
      transformedData.push(courseData);
    }
  });

  return transformedData;
};

module.exports = transformCSV;
