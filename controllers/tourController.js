//const fs = require('fs')
const Tour= require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync')
const AppError=require('../utils/appError')


// const tours = JSON.parse(  //convert json string to java script obj to use it inside the code 

//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );



  
//   exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//       return res.status(400).json({ //missing content bad req
//         status: 'fail',
//         message: 'Missing name or price'
//       });
//     }
//     next();
//   };
  
    




// exports.checkID=((req,res,next,val)=>{ 
//   console.log(`${val}`);
//   // if (req.params.id*1>tours.length)
//     if (val>tours.length-1)
//         {
            
//         return res.status(404).json({
//                 status:"fail",
//                 message:'Invalid id '

//             })
//         }
       
//   next()
//   })




// exports. getAllTours=(req,res)=>{
//     console.log(req.requestTime)
//     res.status(200).json({
       
//         status: 'success',
//         requestedAt:req.requestTime,
//         results: tours.length,
//         data: {
//           tours
//         }
//       });

//     }
//     exports. createTour=(req,res)=>{
//     // console.log(req.body)exports. tourID =  toursData.length +1
//  const newID = tours[tours.length-1].id +1
//  const newTour= Object.assign({id:newID},req.body)
//   tours.push( newTour)
//    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{ //if u didn't overwrite the file while not be saved each time u restart server
//     //stringify is to convert js obj to JSON String.
//      res.status(201).json(  //201 created
//               {status:'success',
//                 data:{
//                     tour :newTour
//                 }
//             }

//       )
//   })
   
// }
// exports. getTour=(req,res)=>{
//     // app.get('/api/v1/tours/:id/:x/:y?',(req,res)=>{ //?means not required , all after : is called params 
//          ///api/v1/tours/5/6/7
//          //{ id: '5', x: '6', y: undefined }
//          //{ id: '5', x: '6', y: '7' }
//      // console.log(req.params)
//      const Id =req.params.id * 1  //convert string to number  string*num=num
//         const tour=tours.filter((el)=>el.id===Id)
//        // const tour=tours.find((el)=>el.id===Id)
//     //     if (Id>tours.length-1)
//     //     {
//     //         //res.status(404).json({
//     //      res.status(404).json({
//     //             status:"fail",
//     //             message:'Invalid id '

//     //         })
//     //     }
//     //   else{
//       res.status(200).json({
//       status:"success",
//       data:{ tour :tour}

//       })

//     //  }
// }
// exports.updateTour=(req,res)=>{ //put will return the whole obj in res
   
//     const Id =req.params.id * 1

//     const tour=tours.filter((el)=>el.id===Id)
//   //  console.log(req.body)

//     // if (tour.length<=0)
//     // {
       
//     //     return res.status(404).json({
//     //         status:"fail",
//     //         message:'Invalid id '

//     //     })
//     // }  
    
   
//             const keys = Object.keys(tour[0]);  
//             // console.log( "keys", keys)
//              keys.forEach((key) => {
//               //  console.log(tour[0][key]);
//               //  console.log(req.body[0][key])
             
//                 if(key!=='id') // id will not be changed at all
//                {  if(req.body[0][key]) // if no value will retrieve the old obj 
                   
//                   tour[0][key]=req.body[0][key]}
//             }
//             );

       
//           fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{
//            res.status(200).json({
//            status:"success",
//              data:{tour} //to return all obj and edit only parts whanted to be edit (check that later)
  
//          })
//          })}
//          exports. deleteTour=(req,res)=>{
   
//             const Id =req.params.id * 1
           
        
//             const tour=tours.filter((el)=>el.id===Id)
//              tours.splice(Id,1)
//              console.log(tours[Id])
//             // if (Id>tours.length-1)
//             // {
               
//             //     return res.status(404).json({
//             //         status:"fail",
//             //         message:'Invalid id '
        
//             //     })
//             // }  
            
           
//                   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{
//                    res.status(204).json({
//                    status:"success",
//                      data:null
          
//                  })
//                  })}


////////////////using db


exports.aliasTopTours=(req,res,next)=>{ //set properts of query to make a logic on a route
  req.query.limit='5';
  req.query.sort='-ratingsAverage,price';
  req.query.fields='ratingsAverage,name,price,duration';
 
  next()
}


 

exports. getAllTours= catchAsync (async(req,res)=>{ //did not use catch here (!tour) cause if there is no data so data=0 and that's okay when get all data and not considered an error
  
 

  // try{

    //const tours = await query //u excute this way cause to use another fun like sort/limit u have to make that on the result itself (query object)
   
       const features = new ApiFeatures (Tour.find(),req.query).filter().sort().limitFields().paginate() //create an instance of class
        const tours = await features.query 

    res.status(200).json({
        
         status: 'success',
         requestedAt:req.requestTime,
         results: tours.length,
         data: {
           tours
         }
       });

  // }  catch (err) {
  //      //console.log(err)
  //     res.status(400).json({
     
  //     status: 'fail',
  //     Message: 'error from GetAll method',
     
  //   });

  // }
})


  exports. createTour= catchAsync ( async (req,res,next)=>{
    const newTour=  await Tour.create(req.body)
    res.status(201).json(  
              {status:'success',
                data:{
                    tour :newTour
                }
            }

      )})
       

 

exports. getTour= catchAsync ( async (req,res,next)=>{
     

   // const Id =req.params.id * 1  
   const  tour = await Tour. findById (req.params.id )
 // const tour = await Tour.findOne({_id:req.params.id })

//  if( tour==='null'){
//   return next (new appError('No tours found with that id ',404))
// }
if (!tour) { //if it's valid but not exists  ( it's diff from invalid which is cast error is not an operational error and will not be handled this way )
  return next(new AppError('No tour found with that ID', 404));
}



 res.status(200).json({
  status: 'success',
  data:{
   tour:tour
  }
 })
})



 exports.updateTour= catchAsync (async (req,res)=>{ 
   
  
  const Id =req.params.id * 1

  
    const updatedTour=  await Tour.findByIdAndUpdate(Id,req.body,{
      new: true,
      runValidators: true
    })
    if(!updatedTour){
      return next (new AppError('No tours found with that id ',404))
    }
    return res.status(200).json({
                status:"success",
                data:{
                  tour:updatedTour
                }
      
            })
})
  
 

 exports. deleteTour= catchAsync ( async (req,res)=>{
 
          const Id =req.params.id * 1
         
           const tour = await Tour.findByIdAndDelete(Id)
           if(!tour){
            return next (new AppError('No tours found with that id ',404))
          }

          return res.status(204).json({
                      status:"success",
                      data:null
            
                  })}
       )
       
       //aggregation (groupby,min,avg,match,....)//all steps will be applied together step by step
       exports.getTourStats = catchAsync (async (req, res) => {
        
          const stats = await Tour.aggregate([
            {
              $match: { ratingsAverage: { $gte: 4.5 } } //same as filtering
            },
            {
              $group: { //group by difficulty 
                _id: { $toUpper: '$difficulty' }, //_id :null means put them all in one group
                numTours: { $sum: 1 },// to count documents (assign each to one ,2,3,4,....)
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
              }
            },
            {
              $sort: { avgPrice: 1 } //-1 descendant
            }
            // {
            //   $match: { _id: { $ne: 'EASY' } } //u can filter on group itself 
            // }
          ]);
      
          res.status(200).json({
            status: 'success',
            data: {
              stats
            }
          });
        
      }
       );
      
      exports.getMonthlyPlan = catchAsync ( async (req, res) => {
        
          const year = req.params.year * 1; // 2021
      
          const plan = await Tour.aggregate([
            {
              $unwind: '$startDates' //copy document to 3 document each has one start date (start date here is an arr of 3 ele ) 
            },
            {
              $match: {
                startDates: {
                  $gte: new Date(`${year}-01-01`),
                  $lte: new Date(`${year}-12-31`)
                }
              }
            },
            {
              $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 }, //count
                tours: { $push: '$name' } //create an arr from field name
              }
            },
            {
              $addFields: { month: '$_id' }  //rename group to be month instead of id  so make another field with month  name from id  and delete id
            },
            {
              $project: {
                _id: 0 //don't return id 
              }
            },
            {
              $sort: { numTourStarts: -1 }
            },
            {
              $limit: 12
            }
          ]);
      
          res.status(200).json({
            status: 'success',
            data: {
              plan
            }
          });
       
      });
