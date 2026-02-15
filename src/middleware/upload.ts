import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, S3_BUCKET_NAME } from '../config/s3Config';

// File filter to only allow images
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
    }
};

// S3 storage configuration
const s3Storage = multerS3({
    s3: s3Client,
    bucket: S3_BUCKET_NAME,
    acl: 'public-read', // Make uploaded files publicly readable
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: any, file: any, cb: any) => {
        const uniqueSuffix = uuidv4() + path.extname(file.originalname);
        const key = `school-images/${uniqueSuffix}`;
        cb(null, key);
    },
});

// Export multer upload configured with S3
export const upload = multer({
    storage: s3Storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB as per requirement
    fileFilter: fileFilter,
});
