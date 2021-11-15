//script to import data from file and insert it into db
const dotenv = require('dotenv');
const mongose = require('mongoose');
const Tour = require('../../models/tourModel');
const fs = require('fs')

dotenv.config({ path: './config.env' });


const DB = process.env.DataBASE_URL.replace('<password>',process.env.DATABASE_PASSWORD);
const tours=  JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'))

mongose.connect(DB, { useNewUrlParser: true }).then(
    (con)=>{
        console.log('database connected');
      
    })

    const importData = async()=>{
     try{  await  Tour.create(tours);
            console.log('data inserted')

     }
     //in general if you didn't do a catch block will cause an error in case of then .. but in case of await will not do that 
         catch (err) {
          console.log(err)
        }
        process.exit() 
    }
    const deleteData = async()=>{
    try{ await Tour.deleteMany()
            console.log('data deleted')
    }
           catch (err) {
            console.log(err)
          }

        process.exit() 
    }

    //instead of call fun will try another way related to terminal . accessing --...
     console.log(process.argv) //arr of terminal commands
    if (process.argv[2] === '--import') {
        importData();
      } else if (process.argv[2] === '--delete') {
        deleteData();
      }
