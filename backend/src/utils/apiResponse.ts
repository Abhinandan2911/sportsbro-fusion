import { Response } from 'express';

/**
 * Standard success response format
 */
export const successResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response format
 */
export const errorResponse = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error: any = null
) => {
  // Log error for internal debugging
  if (process.env.NODE_ENV !== 'production' && error) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV !== 'production' ? error : undefined,
  });
}; 