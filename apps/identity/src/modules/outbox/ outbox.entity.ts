
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn('uuid')
  eventId!: string;

  @Column('text')
  payload!: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

function getEncryptionKey(): Buffer {
  const key = Buffer.from(process.env.OUTBOX_ENCRYPTION_KEY ?? '', 'hex');

  if (key.length !== 32) {
    throw new Error('OUTBOX_ENCRYPTION_KEY must be 32-byte hex');
  }

  return key;
}

export function encryptPayload(data: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
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

export function decryptPayload(value: string): unknown {
  const [iv, tag, encrypted] = value.split(':');

  if (!iv || !tag || !encrypted) {
    throw new Error('Invalid encrypted outbox payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(iv, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}
