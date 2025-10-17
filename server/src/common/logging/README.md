# Logging System

This directory contains the Winston-based logging configuration for the application.

## Features

- **File-based logging** with automatic rotation
- **Three separate log files:**
  - `error-YYYY-MM-DD.log` - Error logs only
  - `combined-YYYY-MM-DD.log` - All logs
  - `access-YYYY-MM-DD.log` - HTTP request/response logs
- **Console logging** with colors (for development)
- **Automatic log rotation** - New files daily
- **Log retention:**
  - Error & combined logs: 14 days
  - Access logs: 30 days
- **Automatic compression** of old logs (gzip)
- **Max file size:** 20MB per file

## Log Levels

- `error` - Critical errors
- `warn` - Warnings
- `info` - General information (default)
- `debug` - Debug information
- `verbose` - Detailed information

## Configuration

Set `LOG_LEVEL` environment variable to control verbosity:

```bash
# In .env file
LOG_LEVEL=debug  # For development
LOG_LEVEL=info   # For production (default)
```

## Log Location

All logs are stored in: `server/logs/`


## Usage in Code

The logger is automatically injected via Winston module. No need to manually configure in services.

```typescript
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class MyService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  myMethod() {
    this.logger.log('Info message', 'MyService');
    this.logger.error('Error message', 'stack trace', 'MyService');
    this.logger.warn('Warning message', 'MyService');
  }
}
```

