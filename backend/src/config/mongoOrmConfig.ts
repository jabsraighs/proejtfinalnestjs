import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charge explicitement le fichier .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });
if (result.error) {
  throw new Error(`Error loading .env.local file: ${result.error.message}`);
}

// Vérifie si les variables essentielles sont chargées
const requiredEnvVars = [
  'MONGO_HOST',
  'MONGO_PORT',
  'MONGO_INITDB_ROOT_USERNAME',
  'MONGO_INITDB_ROOT_PASSWORD',
  'MONGO_DATABASE'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is missing in .env.local`);
  }
}

// Construction de l'URL MongoDB à partir des variables d'environnement
const mongoUrl = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;



export const mongoDataSource = new DataSource({
  type: 'mongodb',
  url: 'mongodb://root:password@mongo:27017/cleanCodeArchitecture?authSource=admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  logging: true,
  entities: [path.resolve(__dirname, '../Model/Mongo/*.mongo{.ts,.js}')],
});