import 'dotenv/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({


  type: 'postgres',
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT)!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,

  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: ['src/infra/database/migrations/*.ts'],

  synchronize: false,
})

export default dataSource