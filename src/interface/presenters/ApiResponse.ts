export class ApiResponse {
  static success(message: string, data: Record<string, unknown> = {}) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error: Record<string, unknown> = {}) {
    return {
      success: false,
      message,
      error,
    };
  }
}

