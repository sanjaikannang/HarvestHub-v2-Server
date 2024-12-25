import { CustomError } from "./customError.js";

export const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error('Error in AsyncHandler:', err);
        
        if (err instanceof CustomError) {
          return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          });
        }
  
        return res.status(500).json({
          status: 'error',
          message: 'Internal Server Error'
        });
      });
    };
  };