import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandlers.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/', (req, res) => res.json({ status: 'ok', service: 'blog-api' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI');
  process.exit(1);
}

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`✅ Server http://localhost:${PORT} | Docs: /api/docs`));
}).catch((e) => {
  console.error('DB connection error:', e.message);
  process.exit(1);
});
