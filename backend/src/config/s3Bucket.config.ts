import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from 'nanoid';
import { env } from "./env.config";

const region = env.AWS_REGION as string;
const accessKey = env.AWS_ACCESS_KEY as string;
const secretAccessKey = env.AWS_SECRET_ACCESS_KEY as string;
const bucketName = env.AWS_BUCKET_NAME as string;
const putUrlExpiry = Number(env.AWS_PUT_URL_EXPIRY);
const getUrlExpiry = Number(env.AWS_GET_URL_EXPIRY);

export const s3Bucket = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
});

export async function getObjectURL(key: string) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const getURL = await getSignedUrl(s3Bucket, command, { expiresIn: getUrlExpiry }); 
    return getURL;
};

export async function putObjectURl(
    filename: string,
    fileType: string,
): Promise<{ uploadURL: string; fileURL: string }> {
    
    const key = `profile-images/${nanoid()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: fileType,
    });

    const uploadURL = await getSignedUrl(s3Bucket, command, { expiresIn: putUrlExpiry }); 
    const fileURL = key; 
    
    return { uploadURL, fileURL };
};