import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import nuxtConfig from '../../nuxt.config.js';
import * as express from 'express';
import { Nuxt, Builder } from 'nuxt';

import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express/adapters/express-adapter';

async function bootstrap() {
  const server = express();
  const logger = new Logger();
  const nuxtServer = await createNuxtServer();

  // 其他分流至nuxt
  server.get(/^(?!\/?(api|doc)).+$/, (request, response) =>
    nuxtServer.render(request, response),
  );

  // 创建服务
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: console,
  });

  await app
    .listen(3000)
    .then(() => logger.log('服务启动成功:', 'http://localhost:3000'));
}

async function createNuxtServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  // 用指定的配置对象实例化 Nuxt.js
  nuxtConfig['dev'] = !isProd;
  const nuxt = new Nuxt(nuxtConfig);

  if (!isProd) {
    await new Builder(nuxt).build();
  }

  return nuxt;
}

bootstrap();
