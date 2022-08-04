import fs from "fs";
const path = require("path");
const UPLOAD_FOLDER = "upload";

export const uploadFile = (filePath, callback) => {
  const fileName = path.basename(filePath);
  const despath = path.join(path.resolve(UPLOAD_FOLDER), fileName);
  fs.copyFile(filePath, despath, callback);
};

export const getUploadedFilePath = (fileName) => {
  return path.join(path.resolve(UPLOAD_FOLDER), fileName);
};

export const deleteUploadedFilePath = async (fileName) => {
  const filePath = "./upload/" + fileName;
  fs.unlink(filePath, function (err) {
    if (err) throw err;
  });
};

export const renameUploadedFilePath = (fileName, newFileName, callback) => {
  const filePath = "./upload/" + fileName;
  const newfilePath = "./upload/" + newFileName;
  fs.rename(filePath, newfilePath, callback);
};

export default {};
