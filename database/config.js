const mongoose = require('mongoose');

const dbConnect = () => {

    try {

        mongoose.connect( process.env.MONGODB_CON, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('Base de datos online');
        
    } catch (error) {
        console.log(error);
        throw new Error('Error al conectar con Base de datos');
    }

    
}

module.exports = {
    dbConnect
}