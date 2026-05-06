require('dotenv').config();
const port = process.env.PORT || 5000;
const path = require('path');

const cors = require('cors');

const express = require('express');
const app = express();

const { connectDB } = require('./src/config/database'); 

//relationship all table
require("./src/models/relation")

app.use(cors());

// const  {requireAdmin,requireLogin}= require('./src/middlewares/authMiddleware');
const apiRoutes = require('./src/routes/api')

//config req.body
app.use(express.json()) ;// for json
app.use(express.urlencoded({ extended: true })); // for form data


//api
app.use('/v1/api',apiRoutes);

(async () => {
    try {
        //using postgresSQL
        await connectDB();

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()
