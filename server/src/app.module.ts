import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { GitModule } from './git/git.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [AppConfigModule, AuthModule, GitModule, NotesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
