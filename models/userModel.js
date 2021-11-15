const crypto = require('crypto'); // built in no need for installation  
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], //validator [one of them ]
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date, //not for all users only who changed there pass
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12(will take more time and encrypt will if it's higher than 12)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field to not to presist it into db
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword=async function (candidatepassword,userpassword){  //instance methods that are for all documents of the collection
  return await bcrypt.compare(candidatepassword,userpassword) //we can't compare manually without bcrypt as userpass is hashed unlike candidatepass
} // we can't use this.pass as reference to pass of current doc and have to get it from outside cause we did select pass=false 


userSchema.methods.changedPasswordAfter= function (JWTTimestamp)//time where token is created
{
if(this.passwordChangedAt){
  console.log(this.passwordChangedAt,JWTTimestamp)
  const changedTimestamp=parseInt((this.passwordChangedAt.getTime()/1000),10) //turn date into int with 10 system 
  return JWTTimestamp<changedTimestamp

}
return false //user did not change his pass after time stamp
}

//create random hexa string and hash it to save in db for security ,return unhashed version to send it back to the user via gmail 
userSchema.methods.createPasswordResetToken= function ()
{
  const resetToken=crypto.randomBytes('32').toString('hex')

this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
this.passwordResetExpires= Date.now() +10*60*1000
return resetToken
}


userSchema.pre('save', function(next){
  if(!this.isModified('password') || !this.isNew) return next() //isModified/isNew are built in funs(if doc is new so it will be modified 'first time' and we want to ignore that) 
this.passwordChangedAt=Date.now()-1000 //-1000 cause sometimes db store late than token send so we need to make it early for ex 1 second 
next()
})

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;