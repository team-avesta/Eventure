import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3/client';

export class S3DataService {
  constructor(private bucket: string = process.env.S3_BUCKET_NAME || '') {
    if (!this.bucket) {
      throw new Error('S3 bucket name is not configured');
    }
  }

  async getData<T>(filename: string): Promise<T> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: `data/${filename}.json`,
      });

      const response = await s3Client.send(command);
      const data = await response.Body?.transformToString();
      return JSON.parse(data || '{}');
    } catch (error) {
      console.error(`Error fetching ${filename}:`, error);
      throw error;
    }
  }

  async updateData(filename: string, data: any): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: `data/${filename}.json`,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });

      await s3Client.send(command);
    } catch (error) {
      console.error(`Error updating ${filename}:`, error);
      throw error;
    }
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error(`Error uploading file ${key}:`, error);
      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error(`Error deleting file ${key}:`, error);
      throw error;
    }
  }
}
