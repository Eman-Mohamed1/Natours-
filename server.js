const dotenv = require('dotenv');
const mongose = require('mongoose');


//// handling sync err(like something is not defined) it must be before it to recognize it 
//any errors after that will be from a req (will access middlewares were then be handled in error middleware itself (errorController))
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1); //no need to close first cause there are no reqs in the background but u have to shut down and restart app after then 
  });

dotenv.config({ path: './config.env' });

const app = require('./app'); //define app after define env vars
const Tour = require('./models/tourModel');

const DB = process.env.DataBASE_URL.replace('<password>',process.env.DATABASE_PASSWORD);


mongose.connect(DB, { useNewUrlParser: true }).then( //res of connect returns a promise
    (con)=>{
        console.log('database connected');
       // console.log('connections obj',con.connections);
    }
)
//old way for creating a document
// const tour= new Tour({
//     name:'eman2',
//     price:'50',
//     rating:'5'
// })
// tour.save().then((doc)=>console.log('all docs',doc)).catch(err=>console.log(err))


//to set Node env (some node packsges  dependence on the  Node env so express has to define it )  use NODE_ENV=development nodemon server.js in terminal or create this file config.env put all env vars inside it //u can use diff database/debug/login info .. for  different envs 
//u can add any variable to process.env by using command  for ex to define x : x=25 nodemon server.js or create this file config.env put all env vars inside it and install dotenv to config them 
 //console.log(app.get('env'))// there are alot of env provide by node but the most important are development (default) -production 
 //console.log(process.env) // gives all vars in the current env . alot of envs provide by node /the var env and process are  global . 
const port= process.env.PORT || 3000
const server =app.listen ( port,()=>{console.log(`app running on port ${port}`);});


///// async error handling
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => { //as it's async may some req are in the background so u have to wait and close server first then shutdown
      process.exit(1);
    });
  });
