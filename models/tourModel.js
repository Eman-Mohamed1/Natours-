const mongose = require('mongoose');
const { default: slugify } = require('slugify');
// const validator = require('validator');


const tourSchema = new mongose.Schema({

        name: {
          type: String,
          required: [true, 'A tour must have a name'], //built in validation
          unique: true,
          trim: true,
          maxlength: [40, 'A tour name must have less or equal then 40 characters'], //min/max for nums
          minlength: [10, 'A tour name must have more or equal then 10 characters']
          // validate: [validator.isAlpha, 'Tour name must only contain characters'] //using external validation
        },
        slug:String,
        

        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
          },

        maxGroupSize: {
          type: Number,
          required: [true, 'A tour must have a group size']
        },
        difficulty: {
          type: String,
          required: [true, 'A tour must have a difficulty'],
          enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
          }
        },
        ratingsAverage: {
          type: Number,
          default: 4.5,
          min: [1, 'Rating must be above 1.0'],
          max: [5, 'Rating must be below 5.0']
        },
        ratingsQuantity: {
          type: Number,
          default: 0
        },
        price: {
          type: Number,
          required: [true, 'A tour must have a price']
        },
        priceDiscount: {
          type: Number,
          validate: { //using custom validation
            validator: function(val) { //val=priceDiscount
              // this only points to current doc on NEW document creation (not on update)
              return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
          }
        },
        summary: {
          type: String,
          trim: true,
          required: [true, 'A tour must have a description']
        },
        description: {
          type: String,
          trim: true
        },
        imageCover: {
          type: String,
          required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
          type: Date,
          default: Date.now(),
          select: false //no one has right to get it from select query
        },
        startDates: [Date],
        secretTour: {
          type: Boolean,
          default: false
        }
       

      },{  //option obj of schema
       toJSON:{virtuals:true},
       toObject:{virtuals:true}
      })

 //virtual (derived) property not saved in data base but will show with specific select (get in this case )
 //created here instead of in controllers cause it related to bussiness logic (thin controller) 
  tourSchema.virtual('durationWeeks').get(function(){// ordinary fun used to enable using this (refers to the current document ) which not provide by arrow fun
     return this.duration / 7; //7/7=1week
  })



 //moongose also has middlewares concept when a certin event happens before or after saving data into data base 
 // the first kind of middlewares is document middleware which happen on .save() - create()  events only (pre/post them ) not on update
  tourSchema.pre('save',function(next){ //this fun called pre save hook
    console.log(this) //refers to current document that going to be saved 
    //slug is a string we can put usually in url based on another string 
    this.slug=slugify(this.name,{lower:true}) //u have to define slug in schema or this field will not appear 
    next()// u have to use it or app will stuck in this middleware not moving to another in middlewareStack
  })
 //u can use multiple post /pre middlewares 
  tourSchema.post('save',function(doc,next){
    console.log(doc) //current doc that just saved 
    next()
  })


  //2) query middleware (this refers to query Obj) //pre and post of query applying


 // tourSchema.pre('find',function(next){ //apply before any of  all  find queries only  
 //but what about find one (by id )? so we use regular exp for each starts with find
 tourSchema.pre(/^find/,function(next){
    this. find ({secretTour:{$ne:true}}) //!=
    this.start=Date.now() //set prop to obj 
    next()
  })
                    
  tourSchema.post('find',function(docs,next){  
    console.log(docs)//docs that result of query
    console.log(`query took ${Date.now()-this.start} milliseconds `)
    next()
  })



//3) Aggregate middleware (pre and post)

tourSchema.pre('aggregate',function(next){
 //remove secret tour also from aggregation
console.log(this.pipline());
this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //simply exclude secret tour by adding another match in pipleine obj of aggregation //unshift =add ele to be first ele in the array 

  next()
})


const Tour = mongose.model('Tour',tourSchema);

module.exports=Tour;









