import multer from 'multer';
import path from 'path';
import multerS3 from 'multer-s3';
import { s3Client, S3_BUCKET_NAME } from '../config/s3Config';


const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check both mimetype and extension for robustness
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
        cb(null, true);
    } else {
        console.log('Rejected file mimetype:', file.mimetype, 'ext:', ext);
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: S3_BUCKET_NAME,
        acl: 'public-read', // Make uploaded files publicly readable
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `profile-images/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
