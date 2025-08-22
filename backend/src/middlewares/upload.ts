import multer, { FileFilterCallback} from 'multer';
import { Request} from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Max 1 file
    fields: 10, // Max 10 non-file fields
    fieldSize: 1024 * 1024 // 1MB per field
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    console.log('File received:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    const allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});