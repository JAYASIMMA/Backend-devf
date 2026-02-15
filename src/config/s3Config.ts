import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 Client
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// S3 bucket name
export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

// Helper to generate S3 URL
export const getS3Url = (key: string): string => {
    const region = process.env.AWS_REGION || 'ap-south-1';
    const bucket = S3_BUCKET_NAME;
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

// Helper to extract S3 key from URL
export const getKeyFromS3Url = (url: string): string | null => {
    const bucket = S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-south-1';
    const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
    if (url.startsWith(prefix)) {
        return url.substring(prefix.length);
    }
    return null;
};

// Helper to delete file from S3
export const deleteFromS3 = async (key: string): Promise<boolean> => {
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        }));
        return true;
    } catch (error) {
        console.error('Error deleting from S3:', error);
        return false;
    }
};
