import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3003; 

    await app.listen(port);
    console.log(`Catalog Service is running on port: ${port}`);
}

bootstrap();