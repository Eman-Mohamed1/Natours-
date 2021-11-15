class AppError extends Error {

constructor(message,statusCode){ 
super(message)  //to inherit constructor of parent //only message will throw to child
this.statusCode=statusCode
this.status=`${statusCode}`.startsWith('4')?'fail':'error' //put '' to convert status code to string to use starts with
this.isOperational=true //set property to check if err is operational or anything else

Error.captureStackTrace(this, this.constructor); //to make this class appear in error stack //console.log(err.Stack) that informe us where error was actually happend
}
}
module.exports= AppError