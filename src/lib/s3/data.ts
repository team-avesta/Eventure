import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3/client';
import { Module, ScreenshotStatus } from '@/services/adminS3Service';

interface ScreenshotUploadParams {
  key: string;
  pageName: string;
  customName?: string;
  status: ScreenshotStatus;
}

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

  async processScreenshotUpload({
    key,
    pageName,
    customName,
    status,
  }: ScreenshotUploadParams) {
    // Get existing modules to validate module exists
    const data = await this.getData<{ modules: Module[] }>('modules');
    const modules = data?.modules || [];
    const targetModule = modules.find((m: Module) => m.key === pageName);

    if (!targetModule) {
      throw new Error('Module not found');
    }

    // Create screenshot metadata
    const timestamp = Date.now();
    const sanitizedName = customName
      ? customName.trim().replace(/\s+/g, '-').toLowerCase()
      : key.split('/').pop()!;

    const screenshot = {
      id: timestamp.toString(),
      name: sanitizedName,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`,
      pageName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status,
    };

    targetModule.screenshots = [
      ...(targetModule.screenshots || []),
      screenshot,
    ];
    await this.updateData('modules', { modules });

    return screenshot;
  }
}
