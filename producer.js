const { v4: uuidv4 } = require('uuid');
const { Kafka, CompressionTypes, logLevel } = require('kafkajs');

const lodash = require('lodash');

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`my-cluster-kafka-bootstrap:9092`],
  clientId: 'example-producer',
});

const topic = 'my-topic';
const producer = kafka.producer();

const getCoords = () => {
  // console.log("in getCoords()");
  return [
    Math.round(Math.random()) ? parseFloat(((Math.random() * 180) * -1).toFixed(6)) : parseFloat((Math.random() * 180).toFixed(6)),
    Math.round(Math.random()) ? parseFloat(((Math.random() * 90) * -1).toFixed(6)) : parseFloat((Math.random() * 90).toFixed(6))
  ];
}

const getGeoSpatialData = lodash.once(() => new Array(parseInt(process.env.NUM_VEHICLES)).fill().map(_ => getCoords()));

// console.log(getGeoSpatialData());

const getNumMessages = () => parseInt(process.env.NUM_MSG)
const getKey = () => uuidv4();
const getCustomerId = () => Math.round(Math.ceil(Math.random() * parseInt(process.env.NUM_CUSTOMERS)));
const getVehicleId = () => Math.round(Math.ceil(Math.random() * parseInt(process.env.NUM_VEHICLES)));
const getRandomTemp = () => parseFloat((Math.random() * parseInt(process.env.MAX_TEMP)).toFixed(1));

const geo = ['US-DC', 'DE-BW', 'DE-BE', 'IN-DL'];
const getLocation = () => {
  geoIndex = Math.round(Math.floor(Math.random() * 4));
  return geoIndex >= 1 ? geo[geoIndex] : geo[0];
};

const getLoc = lodash.once(() => new Array(parseInt(process.env.NUM_VEHICLES)).fill().map(_ => getLocation()))


const createMessage = (key, customerId, vehicleId, temp, loc, geo) => {
  // console.log("create", geo);
  kafkaMsg = {
    key: JSON.stringify({ _id: key }),
    // key: key,
    value: JSON.stringify({
      ts: new Date().toISOString(),
      metadata: { customerId: customerId, vehicleId: vehicleId, location: loc[vehicleId - 1] },
      customerId: customerId,
      vehicleId: vehicleId,
      temperature: temp,
      location: loc[vehicleId-1],
      geoSpatial: { type: "Point", coordinates: geo[vehicleId - 1] }
    })
  }
  // console.log(kafkaMsg);
  return kafkaMsg;
};

const sendMessage = async () => {
  // console.log(            createMessage(
  //   getKey(),
  //   getCustomerId(),
  //   getVehicleId(),
  //   getRandomTemp(),
  //   getLoc(),
  //   getGeoSpatialData()
  // ));

  try {
    let message =
      await producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: Array(getNumMessages())
          .fill()
          .map(_ =>
            createMessage(
              getKey(),
              getCustomerId(),
              getVehicleId(),
              getRandomTemp(),
              getLoc(),
              getGeoSpatialData()
            )
          )
      });
    console.log(`[producer/send] ${message}`, message);
  } catch (e) {
    console.error(`[producer/send] ${e.message}`, e);
  }
};

const run = async () => {
  await producer.connect();
  setInterval(sendMessage, parseInt(process.env.SEND_INTERVAL))
};

run().catch(e => console.error(`[producer/run] ${e.message}`, e));
