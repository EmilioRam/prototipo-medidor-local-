const { Schema, model  } = require('mongoose');

const lecturaSchema = Schema({
    timestamp: {
        type: String,
        required: [true, 'falta timestamp']
    },
    CO2: {
        type: String,
        required: [true, 'falta CO2']
    },
    temp: {
        type: String,
        required: [true, 'falta temp']
    },
    hum: {
        type: String,
        required: [true, 'falta hum']
    }
},
{ capped: 1048576 }); // "capamos" la Coleccion a 1MB de memoria (unos 5000 lecturas) para que no crezca indefinidamente);

module.exports = model('Lectura', lecturaSchema);