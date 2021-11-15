const User = require('./../models/userModel');
const jwt= require ('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync');
const AppError=require('./../utils/appError')
const {promisify}=require('util')//built in module to return a promise 
const sendEmail=require('./../utils/email')
const crypto = require('crypto');

const signToken = id => { //create token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN  //after that user has to be register again even token is correct for secure system
    });
  };


  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
     const cookieOptions={
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //mSec
      ),
      httpOnly: true //browser can only send and receive not edit or access 
    };


    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //set secure prop (transfer cookie via Https only)

    res.cookie('jwt',token,cookieOptions)

 // Remove password from output
 user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

exports.signup = catchAsync(async (req, res, next) => {
   // 1) create user from database 

    // const newUser = await User.create(req.body) don't do that and accept only specific fields not something else 
    const newUser = await User.create({
     name:req.body.name ,
     email:req.body.email,
     password:req.body.password,
     passwordConfirm: req.body.passwordConfirm

    })

  // 2) create token and send it    

  //  const token =signToken(newUser._id)  //id:id
 

  //   res.status(201).json({
  //       status:'success',
  //        token,
  //       message:'user signed up successfully ',
  //       data:{
  //          user: newUser
  //       }

  //   })
  createSendToken(newUser, 201, res);

});
  
exports.login = catchAsync(async (req, res, next) => {
      const {email,password}=req.body
        //1) check if email &password exist 

        if ( !email || !password)
      return  next(new AppError('email or password is missing',400))

        // 2) check user exists and pass is correct
   const user = await User.findOne({email}).select('+password') //+ return explicity even its select:false
//    const correct =await user.correctPassword(password,user.password)//as correctPassword is an instance method that can be available for any doc 
//   if (!user || !correct){
  console.log('user',user)
    if (!user || ! (await user.correctPassword(password,user.password)) ){ 
     return   next(new AppError('Incorrect email or password',401))
  }

  //if everything ok ,send token to client
//  const token =signToken(user._id) //{id:mewUser._id}

//  res.status(200).json({
//      status:'success',
//      token,
//      message:'user logined in successfully ',
//      data:{
//         user: user
//      }

// })

createSendToken(user, 200, res);


})
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }


if (!token) {
  return next(
    new AppError('You are not logged in! Please log in to get access.', 401)
  );
}
//2)verification of Token (create test signature and compare with the original signture )(not enough to send only token u have to check that the payload is not changed)(or if the token expired )

const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET) //fun(arg)(excute call back after promise returned )
 console.log('decoded',decoded)
//if created sig is not the same so invalid token error occurs and u need to handle if (if payload changed for ex (in this case user id ) )
//if token is expired u need to handle this err also


//3) for more security check if the user exists even if there is a token  

const currentUser= await User.findById(decoded.id)
if(!currentUser)
{
  return next(new AppError('the user belonges to this token is no longer exist ! ',401))
}


//4)for more security check if user did not change the password (create instance method)

if (currentUser.changedPasswordAfter(decoded.iat)) //iat= timestamp
{

  return next(new AppError('user changed his pass .please log in again ',401))

}

req.user=currentUser //if there is another middleware needs the content
next() // if all okthen access protect route

})

//remember diff between authentication and authorization 

exports.restrictTo=(...roles)=>{ //fun returns a middleware cause we need the middleware to take args 
//role is an arr // roles ['admin', 'lead-guide']
return (req,res,next)=>{
if (!roles.includes(req.user.role)){ //we have access to req.user from the previouse middleware 
return next(new AppError ('this role does not have a permission  to perform this action ',403));
}
next()
};
};

exports.forgotPassword = catchAsync(async (req, res, next) => { //user send a random token with his email  to forget pass route

 // 1) Get user based on the email sent via body ( POSTed email)

const user =new User.findOne({email:req.body.email})
if (!user){
return next (new AppError('there is no user with this email'),404)
}

 // 2) Generate the random reset token (not jwt but random string)
 const resetToken = user.createPasswordResetToken();
 await user.save({ validateBeforeSave: false });//in user model we just modified the date and now want to save them /validate=false hence that will not ask for all data 

 // 3) Send it to user's email
 const resetURL = `${req.protocol}://${req.get(
  'host'
)}/api/v1/users/resetPassword/${resetToken}`;

const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

try {
  await sendEmail({  //patch
    email: user.email,
    subject: 'Your password reset token (valid for 10 min)',
    message
  });

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
} catch (err) {   //use try and catch cause we need to do more actions here not just a simple message
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return next(
    new AppError('There was an error sending the email. Try again later!'),
    500
  );
}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
 // 1) get the user based on the token in req.params
const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: { $gt: Date.now() } //check if expired or not 
})

 // 2) check if user exists and the token is not expired 
 if(!user)
 return next(new AppError('Token is invalid or has expired'),400) //bad req
 // 3) set the updated property date into db 
    
// set changedPasswordAt property for the user in user model

 //4)update password and let user login
 user.password=req.body.password
 user.passwordConfirm=req.body.passwordConfirm
 user.passwordResetToken = undefined;
 user.passwordResetExpires = undefined;
 await user.save();
 // 4) Log the user in, send JWT
 createSendToken(user, 200, res);


 }) // server return the token (after receiving it with the new Pass)



  
 exports.updatePassword=catchAsync(async(req,res,next)=>{
  // 1) get user 
  const user = await User.findById(req.user.id).select('+password'); 

  // 2) Check if POSTed current password is correct
  if (!await user.correctPassword(req.body.passwordCurrent, user.password))
  return next(new AppError('Your current password is wrong.',401))

 // 3) If so, update password
 user.password = req.body.password;
 user.passwordConfirm = req.body.passwordConfirm;
 await user.save();
 // User.findByIdAndUpdate will NOT work as intended!

//use find by id and update only for unsensitive data cause validate happens only in create so we want to restrict and compare pass and confirm pass (also all pre methods only in create)
   // 4) Log user in, send JWT
   createSendToken(user, 200, res);
  });