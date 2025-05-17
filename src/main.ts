import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	const configService: ConfigService = app.get(ConfigService);
	const allowedOrigins: string[] = configService.get<string>('CORS_ALLOWED')?.split(',') || [];
	const databaseMongo: string = configService.get<string>('MONGO_HOST') || 'default';
	const databaseMongoHost: string = configService.get<string>('MONGO_HOST') || 'default';
	const databaseMongoPort: string = configService.get<string>('MONGO_PORT') || 'default';
	const databaseMongoDb: string = configService.get<string>('MONGO_DB') || 'default';

	const globalPrefix: string = 'api';
	const port: string | number = process.env.PORT || 3000;
	const hostname: string = process.env.HOSTNAME?.toString() || 'localhost';

	app.setGlobalPrefix(globalPrefix);
	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		allowedHeaders: [
			'Content-Type', 
			'Authorization', 
			'Accept', 
			'Origin', 
			'X-Requested-With'
		  ],
		  credentials: true,
	});
	const documentFactory = () => SwaggerModule.createDocument(app, 
		new DocumentBuilder()
		.setTitle('API Documentation')
		.setDescription('API Documentation')
		.setVersion('1.0')
		.build()
	);
	SwaggerModule.setup('api/docs', app, documentFactory, {
		jsonDocumentUrl: 'swagger/json',
	});

	await app.listen(port, hostname);

	Logger.log(`Allowed Origins (CORS): ${allowedOrigins} (default: *)`);
	Logger.log(`🛢️  Mongo Database used: ${databaseMongo} (${databaseMongoHost}:${databaseMongoPort}/${databaseMongoDb})`);
	Logger.log(`🚀 Application is running on: http://${hostname}:${port}/${globalPrefix}`);
}

bootstrap();