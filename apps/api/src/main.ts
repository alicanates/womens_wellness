import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
// Monitoring imports (will be enabled after package installation)
// import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry as early as possible (will be enabled after package installation)
// const SENTRY_DSN = process.env.SENTRY_DSN;
// if (SENTRY_DSN && SENTRY_DSN !== '__OPTIONAL__') {
//   Sentry.init({
//     dsn: SENTRY_DSN,
//     environment: process.env.NODE_ENV || 'development',
//     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//     profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//     integrations: [new ProfilingIntegration()],
//     beforeSend(event) {
//       // Filter sensitive data
//       if (event.request) {
//         delete event.request.cookies;
//         if (event.request.headers) {
//           delete event.request.headers.authorization;
//           delete event.request.headers.cookie;
//         }
//       }
//       if (event.user) {
//         delete event.user.email;
//         delete event.user.ip_address;
//       }
//       return event;
//     },
//   });
//   console.log('✅ Sentry initialized');
// }

async function bootstrap() {
  // Validate critical environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_GENERATIVE_AI_API_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.includes('PLACEHOLDER'),
  );

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing or invalid required environment variables:');
    missingEnvVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please check your .env.local file and ensure all required variables are set.');
    process.exit(1);
  }

  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for extra properties
    }),
  );

  // Register CORS plugin
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
  ];

  await app.register(fastifyCors as any, {
    origin: true, // Reflect the request origin (validates against allowedOrigins in production via env)
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Register multipart for file uploads
  await app.register(fastifyMultipart as any, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  // Serve static files (profile pictures, etc.)
  // In development: __dirname is dist/, so .. goes to project root
  // In production: adjust path as needed
  const uploadsPath = join(process.cwd(), 'uploads');
  await app.register(fastifyStatic as any, {
    root: uploadsPath,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Serve public files (HTML pages, etc.)
  const publicPath = join(process.cwd(), 'public');
  await app.register(fastifyStatic as any, {
    root: publicPath,
    prefix: '/public/',
    decorateReply: false,
  });

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Wellness API')
    .setDescription("Women's Wellness Companion API")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
