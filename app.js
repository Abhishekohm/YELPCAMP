const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campgroung');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


mongoose.connect('mongodb://localhost/yelpcamp', {     useNewUrlParser: true, 
      useCreateIndex: true,
      useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('conneced to mongoose')
});



app.listen(3000, () => {
    console.log("Listening to server 3000")
})

app.get('/', (req,res) => {
      res.render('home')
})

app.get('/test', async (req,res) => {
    const camp = new Campground({title: 'backyard',price: 'free'})
    await camp.save();
    res.send(camp)

})