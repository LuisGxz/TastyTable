import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';

// Serverless entry for Vercel: bootstrap the Nest app once per warm container,
// then hand requests to the underlying Express instance.
const server = express();
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
}

export async function handler(req: Request, res: Response): Promise<void> {
  if (!ready) ready = bootstrap();
  await ready;
  server(req, res);
}
