export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callBack: Function,
) => {
  //console.log({ file });
  if (!file) return callBack(new Error('No file provided'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];
  // Check if the file extension is in the allowed list
  if (allowedExtensions.includes(fileExtension)) {
    return callBack(null, true);
  }
  callBack(null, false);
};
