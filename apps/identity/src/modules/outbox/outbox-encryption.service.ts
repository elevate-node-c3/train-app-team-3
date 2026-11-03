import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

@Injectable()
export class OutboxEncryptionService{



  getEncryptionKey(): Buffer {
    const key = Buffer.from(process.env.OUTBOX_ENCRYPTION_KEY ?? '', 'hex');

    if (key.length !== 32) {
      throw new Error('OUTBOX_ENCRYPTION_KEY must be 32-byte hex');
    }

    return key;
  }


  encryptPayload(data: unknown): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);

    return [
      iv.toString('hex'),
      cipher.getAuthTag().toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }


  decryptPayload(value: string): unknown {
    const [iv, tag, encrypted] = value.split(':');

    if (!iv || !tag || !encrypted) {
      throw new Error('Invalid encrypted outbox payload');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }



}

