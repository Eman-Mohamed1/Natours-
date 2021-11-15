// there are diff kinds of errors so we want to provide meaningful message for each of them in production (has less info ) and in development (alot of details)
//operational
// non operational errors (mongodb (cast error for invalid id formula/duplicate key/validation errors )) //will be handled in production only by trying to get a good message from properties
// unexpected errors(unhandled promise rejected (async/sync(exceptions)(like fail connection to db)) //those will listen to events (look at server.js)
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError= () => new AppError('Invalid token please log in again', 401); //only in prod 
const handleJWTExpiredError =err => new AppError('your token is expired please log in again ', 401); 

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
 
 
 
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

 module.exports=(err,req,res,next)=>{ //middleware for handling errors provided by express that contains err obj throwen via next as first obj 
  
   // console.log(err.stack);

   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';
 
   if (process.env.NODE_ENV === 'development') {
     sendErrorDev(err, res);
   } else if (process.env.NODE_ENV === 'production') {
     let error = { ...err };
 
     if (error.name === 'CastError') error = handleCastErrorDB(error);
     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
     if (error.name === 'ValidationError')
       error = handleValidationErrorDB(error);
     if (error.name === 'JsonWebTokenError')
     error=handleJWTError(error) 
     if (error.name === 'TokenExpiredError')
     error=handleJWTExpiredError(error) 
     sendErrorProd(error, res);
   }
 };