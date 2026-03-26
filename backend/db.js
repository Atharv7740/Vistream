const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB_URL = process.env.DB_URL

async function connectDb(){
    try{
        await mongoose.connect(DB_URL);
        console.log("DB Connected");
    }catch(err){
        console.log("DB not Connected", err.mssg);
    }
}

module.exports=connectDb;