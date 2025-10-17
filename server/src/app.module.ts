import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { GitModule } from './modules/git/git.module';
import { NotesModule } from './modules/notes/notes.module';
import { LoggerModule } from './common/logging/logger.module';

@Module({
  imports: [LoggerModule, AppConfigModule, AuthModule, GitModule, NotesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
