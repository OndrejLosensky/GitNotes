import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

export class FilePathValidator {
  /**
   * Validates that a file path is safe and within the allowed base directory
   * Prevents directory traversal attacks
   */
  static validatePath(filePath: string, baseDir: string): string {
    // Resolve the absolute path
    const resolvedPath = path.resolve(baseDir, filePath);
    const resolvedBase = path.resolve(baseDir);

    // Check if the resolved path is within the base directory
    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new BadRequestException(
        'Invalid file path: Directory traversal detected',
      );
    }

    // Check for suspicious patterns
    if (filePath.includes('..') || filePath.includes('~')) {
      throw new BadRequestException(
        'Invalid file path: Suspicious characters detected',
      );
    }

    return resolvedPath;
  }

  /**
   * Validates file name doesn't contain dangerous characters
   */
  static validateFileName(fileName: string): void {
    // eslint-disable-next-line no-control-regex
    const dangerousChars = /[<>:"|?*\u0000-\u001f]/;

    if (dangerousChars.test(fileName)) {
      throw new BadRequestException(
        'Invalid file name: Contains forbidden characters',
      );
    }

    if (fileName === '.' || fileName === '..') {
      throw new BadRequestException('Invalid file name');
    }
  }

  /**
   * Validates folder name doesn't contain dangerous characters
   */
  static isValidFolderName(folderName: string): boolean {
    // eslint-disable-next-line no-control-regex
    const dangerousChars = /[<>:"|?*\u0000-\u001f]/;

    if (dangerousChars.test(folderName)) {
      return false;
    }

    if (folderName === '.' || folderName === '..' || folderName.trim() === '') {
      return false;
    }

    return true;
  }
}
