const express=require('express')
const userControllers=require('../controllers/userController')
const authControllers = require('../controllers/authController')

const router=express.Router()


router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.patch(
    '/updateMyPassword',
    authControllers.protect,
    authControllers.updatePassword
  );

router.patch('/updateMe', authControllers.protect, userControllers.updateMe);
router.delete('/deleteMe', authControllers.protect, userControllers.deleteMe);


router.route('/').get(authControllers.protect,userControllers.getAllUsers).post(userControllers.createUser)
router.route('/:id').get(userControllers.getUser).patch(userControllers.updateUser).delete(authControllers.protect,authControllers.restrictTo('admin','guid-lead'),userControllers.deleteUser)

module.exports=router