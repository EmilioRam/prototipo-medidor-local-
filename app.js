const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const sensor = require("node-dht-sensor");
const Colors = require('colors');
const cron = require('node-cron');
require('dotenv').config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const { dbConnect } = require('./database/config.js');
const { guardarDB } = require('./database/DBfunctions');

console.log('empezando');
const fecha = new Date().toLocaleDateString().replaceAll("/", "-");

const csvWriter = createCsvWriter({
    path: `./docs/${fecha}.csv`,
    header: [
        {id: 'timestamp', title: 'TIMESTAMP'},
        {id: 'CO2', title: 'CO2'},
        {id: 'temp', title: 'TEMP'},
        {id: 'hum', title: 'HUM'}
    ]
});

//Conectar puerto serie
const port = new SerialPort('/dev/ttyAMA0',{
    baudRate: 9600
  }, function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});
//parser que recibe 7 bytes
const parser = port.pipe(new ByteLength({ length: 7 }));

//bytes para el request del CO2 al sensor
const req = Buffer.alloc(7, 'FE440008029F25', 'hex');

let CO2;
let timeStamp = new Date();
let temp;
let hum;

//funcion que se llama a si misma cada 2 seg y manda el request
const sendReq = () => {
    port.write(req);
    // console.log("Enviado comando");
    setTimeout(sendReq, 2000);
    return;
}

//listener que recibe datos del puerto serie
parser.on('data', function(data) {

    timeStamp = new Date();

    // ---- CO2 ----
    // console.log('empezao');
    console.log('========= NUEVA LECTURA ========'.green);
    console.log('Data:', data);

    CO2 = (data[3] * 256 + data[4]) * 10;
    console.log(`timestamp: ${ timeStamp.toLocaleString() }`);
    console.log(`CO2: ${CO2} ppm`);
    // console.log('acabao');

    // ---- TEMP/HUM ----
    sensor.read(11, 23, function(err, temperature, humidity) {
        if (!err) {
            temp = temperature;
            hum = humidity;
            console.log(`temp: ${temp}°C, humidity: ${hum}%`);
        }
      });
});

//Conexion BD Mongo Atlas
const conectarDB = async() => {
   await dbConnect();
}
conectarDB();
//guardar en base de datos lecturas cada 5 minutos
cron.schedule('1 * * * * *', () => {
    console.log('guardando en base de datos...'.yellow);
    let datos = {
        timestamp: timeStamp.toLocaleString(),
        CO2: `${CO2} ppm`,
        temp: `${temp} C`,
        hum: `${hum} %`
    };
    // console.log(datos);
    guardarDB(datos);
    //guardar en csv en local
    csvWriter.writeRecords([datos])       // returns a promise
    .then(() => {
        console.log('Guardado en csv local'.blue);
    });
  });
//ejecutamos por primera vez la función de enviar el req
sendReq();

