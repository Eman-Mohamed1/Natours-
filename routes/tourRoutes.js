const express=require('express')
const tourControllers=require('../controllers/tourController')
const authControllers=require('../controllers/authController')
const router=express.Router() //because Routes is a middleware (apply after sending req to send res) we can use Router fun implemented from express


// router.param('id',(req,res,next,val)=>{ // u can access params from param muddle ware also -this param middle ware will apply only on req of routes here in this file those contains params only 
// console.log(`${val}`);
// next()
// })
//so u can use it to check anything related to params like valid id , ....
//router.param('id',tourControllers.checkID)




// router.route('/').get(tourControllers.getAllTours).post(tourControllers.checkBody,tourControllers.createTour) //checkif req has name and price for example  (apply middleware for specific route only)
// router.route('/:id').get(tourControllers.getTour).patch(tourControllers.updateTour).delete(tourControllers.deleteTour)

router.route('/top-5-cheap').get(tourControllers.aliasTopTours,tourControllers.getAllTours)
router.route('/tour-stats').get(tourControllers.getTourStats);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);
router.route('/').get(authControllers.protect,tourControllers.getAllTours).post(tourControllers.createTour) //checkif req has name and price for example  (apply middleware for specific route only)
router.route('/:id').get(tourControllers.getTour).patch(tourControllers.updateTour).delete(authControllers.protect,authControllers.restrictTo('admin', 'lead-guide'),tourControllers.deleteTour)

module.exports=router
////////////////////


