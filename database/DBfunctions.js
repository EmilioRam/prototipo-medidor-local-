const mongoose = require('mongoose');
const Lectura = require('../models/lectura');
const Colors = require('colors');

const guardarDB = (data) => {
    
    let lectura = new Lectura({
        timestamp: data.timestamp,
        CO2: data.CO2,
        temp: data.temp,
        hum: data.hum
    });

    lectura.save((err, lecturaDB) => {

        if (err) {
            return console.log('error al guardar en DB'.red);
        }

        return console.log('ok al guardar en DB!!!'.green);

    });
}

module.exports = {
    guardarDB
}