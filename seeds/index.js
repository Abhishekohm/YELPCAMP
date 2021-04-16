const path = require('path')
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('../seeds/seedhelper')
const {descriptors,places} = require('../seeds/cities');


mongoose.connect('mongodb://localhost/yelpcamp', {     useNewUrlParser: true, 
      useCreateIndex: true,
      useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('conneced to mongoose')
});

const dataSeeding = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++)
    {
        const data = new Campground({
            img: 'https://source.unsplash.com/collection/483251/1200x900',
            title: `${descriptors[Math.floor(Math.random() * 15)]} ${places[Math.floor(Math.random() * 15)]}`,
            location: `${cities[i].city}, ${cities[i].state}`,
            price: Math.floor(Math.random()*30 + 10),
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque minima omnis velit, amet sunt quos debitis saepe distinctio quisquam dolor nostrum deserunt commodi fuga officiis nam pariatur ullam facere quas dolorem incidunt ea. Nostrum hic nulla maxime molestiae eius ad dolorem praesentium eos quae, soluta voluptates consequuntur ipsam iusto natus officia, earum non eum qui fugiat eaque numquam impedit harum animi! Ad illo molestiae ducimus ullam! Aperiam optio distinctio quisquam animi ullam sit obcaecati natus aut facilis atque! Expedita nostrum, earum rem culpa fugiat omnis, autem aperiam id eaque reprehenderit ab ex modi quae doloremque quos, aliquid a nam perspiciatis?'
        })
        await data.save();
    }
}

dataSeeding().then( () => {
    mongoose.connection.close();
})