import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        GITHUB_TOKEN: Joi.string().required(),
        GITHUB_REPO_URL: Joi.string().uri().required(),
        AUTH_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        NOTES_PATH: Joi.string().default('./data/notes'),
        PORT: Joi.number().default(3001),
        FE_URL: Joi.string().uri().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}
