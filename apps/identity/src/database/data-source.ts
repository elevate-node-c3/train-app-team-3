import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import { UserOrmEntity } from "../modules/users/infastracture/entities/user.typeorm.entity";
import { SessionOrmEntity } from "../modules/auth/sessions/infastructure/entities/session.typeorm.entity";
import { PassengerOrmEntity } from "../modules/passengers/infrastructure/entities/passenger.typeorm.entity";
import { migrations } from "./migrations";

dotenv.config({ path: "apps/identity/.env" });

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "identity_db",
  entities: [UserOrmEntity, SessionOrmEntity, PassengerOrmEntity],
  migrations: migrations,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
