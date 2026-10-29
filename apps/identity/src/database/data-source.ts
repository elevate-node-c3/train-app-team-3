import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { VerificationCode } from '../modules/verification/entities/verification-code.entity';
import { OutboxEvent } from '../modules/outbox/entities/outbox-event.entity';
import { Session } from '../modules/auth/entities/session.entity';
import { migrations } from './migrations';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'identity_db',
    entities: [User, VerificationCode, OutboxEvent, Session],
    migrations: migrations,
    synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;