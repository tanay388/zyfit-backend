// uploader.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { getStorage } from 'firebase-admin/storage';
import { FirebaseService } from '../firebase/firebase.service';

export interface UploadedMulterFileI {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

type UploaderInput = {
  name?: string;
  contentType?: string;
};

@Injectable()
export class UploaderService {
  private readonly storage;
  private readonly bucket;

  constructor(private readonly firebaseService: FirebaseService) {
    this.storage = getStorage(this.firebaseService.app);
    this.bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
  }

  async uploadFile(
    file: UploadedMulterFileI | string,
    path = 'main',
    { name, contentType }: UploaderInput = {},
  ): Promise<string> {
    try {
      const data = typeof file === 'string' ? Buffer.from(file) : file.buffer;
      name ??= typeof file === 'string' ? 'file' : file.originalname;

      // Generate unique filename
      const fileName = `${crypto
        .randomBytes(32)
        .toString('base64url')}-${name}`;
      const fullPath = `${path}/${fileName}`;

      // Create file in bucket
      const fileRef = this.bucket.file(fullPath);

      // Upload file with metadata
      await fileRef.save(data, {
        metadata: {
          contentType:
            contentType ||
            (typeof file === 'string'
              ? 'application/octet-stream'
              : file.mimetype),
        },
      });

      // Make the file publicly accessible
      await fileRef.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fullPath}`;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  }

  async uploadFiles(
    files?: (UploadedMulterFileI | string)[],
    path = 'main',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }
}
