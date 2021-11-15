const express=require('express')
const morgan=require('morgan')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); //http parameter pollution to prevent duplicate fields in req .params "like adding two sort which will cause an error with split {works only with strings but not arr}"

const AppError =require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController')
const tourRouter =require('./routes/tourRoutes')
const userRouter =require('./routes/userRoutes');

const app = express();
// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({ //100 req per hour 
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //ex: if u wrote a $gt '' query for email that will return all users cause it's always true so with this and right pass u can enter !!!lol so it prevents any $ or . {operators of queries from a body}

// Data sanitization against XSS
app.use(xss()); //same but will convert html into ordinary sting

// Prevent parameter pollution
app.use(
  hpp({ //without whiteList option will only keep the last field .
    whitelist: [ //fields which allowed to be duplicated 
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// Body parser, reading data from body into req.body
 app.use(express.json({ limit: '10kb' })); // in order to attach a body in a req u have to use this middleware that stands between req and res to modefy incoming req data  (to get req.body succseefully)  //only accept data not more than 10kb for security stuff
 // Serving static files
 app.use(express.static(`${__dirname}/public`))//u can't route for static files unless u do this middleware -u have to write the whole file name with extension but without public folder (the app assigns automatically the public folder to be a route after he didn't match any other routes   )

 // Test middlewarem
 app.use((req,res,next)=>{ //middleware to attach property to req  
  //  req.requestTime = new Date().toISOString();
   console.log("req.headers",req.headers)
  
   next()

 })
 //console.log(process.env.NODE_ENV)
 // Development logging
 if (process.env.NODE_ENV==='development'){ //don't log in production 
 app.use(morgan('dev')) //3rd party middleware to get http logger (will aplly on all reqs here)
 }
//   app.get('/api/v1/tours',getAllTours)
//   app.post('/api/v1/tours',createTour)
//   app.get('/api/v1/tours/:id',getTour)
//   app.patch('/api/v1/tours/:id',updateTour)
//   app.delete('/api/v1/tours/:id',deleteTour)


// app.route('/api/v1/tours').get(getAllTours).post(createTour)
//   app.use((req,res,next)=>{
//       console.log('middleware that applies only on the coming req from this point and not req above it ')
//       next()
//   })
//   app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)
//   app.route('/api/v1/users').get(getAllUsers).post(createUser)
//   app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser)


//Mounting Routers (divide router app into two routes (mini apps))
 
 //special middleware for specific routes only not for all as the above middlewares
  app.use('/api/v1/tours', tourRouter);
  app.use('/api/v1/users', userRouter);
  app.all('*',(req,res,next)=>{ //madleware to handle invalid urls for all methods  (if req reached this point then that means it does not match any of previous routes)
   // res.status(404).json({
  //   status:'fail',
  //   message:`invalid url ${req.originalUrl}`
         
   // })


   //use a class appError (global/reusable) instead of it 
  //  const err = new Error(`invalid url ${req.originalUrl}`)
  //  err.status='fail'
  //  err.statusCode = 404
  
   next( new AppError(`invalid url ${req.originalUrl}`,404)) //any arg via next is an error will be thrown to error middleware and stop cycle of rest middlewars 
    
  })

  
app.use(globalErrorHandler)

  
module.exports=app

