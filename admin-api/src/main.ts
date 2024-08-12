import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { appConfig } from './configs/configs.constants';
import { CommonLogger } from './common/logger/common-logger';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new CommonLogger('Main');
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('Modern Health Finance Admin API documentation')
      .setDescription('The Back-end API documentation for Modern Health Finance')
      .setVersion('1.0')
      .addTag('template')
      .addBearerAuth({ type: 'apiKey', name: 'Authorization', in: 'header' })
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  // Use custom exception filter.
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

  // Use class serializer.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformInterceptor());

  // Use global validation pipe.
  app.useGlobalPipes(new ValidationPipe());
  //page data limits
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  // Enable CORS for AWS.
  app.enableCors();

  const port = appConfig.port;
  logger.log(`App is listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
