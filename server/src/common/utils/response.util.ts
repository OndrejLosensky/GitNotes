export class ResponseUtil {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message: message || 'Operation successful',
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, statusCode: number = 500) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}
