import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callBack: Function,
) => {
  //console.log({ file });
  if (!file) return callBack(new Error('No file provided'), false);

  const fileExtesnion = file.mimetype.split('/')[1];

  const fileName = `${uuid()}.${fileExtesnion}`;

  callBack(null, fileName);
};
