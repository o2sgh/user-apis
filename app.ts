import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
const app = express();
dotenv.config();
app.use(cors())
app.use(bodyParser.json())
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.listen(process.env.PORT, () => {
  return console.log(`Express server is listening at port: ${process.env.PORT}`);
});
