const { v4: uuidv4 } = require('uuid');
const { Kafka, CompressionTypes, logLevel } = require('kafkajs')

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`my-cluster-kafka-bootstrap:9092`],
  clientId: 'example-producer',
})

const topic = 'my-topic'
const producer = kafka.producer()

const getNumMessages = () => 1000
const getKey = () => uuidv4();
const getRandomTemp = () => Math.round(Math.floor(Math.random() * 80))
const getSensorId = () => Math.round(Math.floor(Math.random() * 100000))
const geo = ['NA', 'LATAM', 'EMEA', 'APAC']
const getGeo = () => {
  geoIndex = Math.round(Math.floor(Math.random() * 4));
  return geoIndex >= 1 ? geo[geoIndex] : geo[0]; 
}

const createMessage = (key, temp, sensorid, loc) => ({
  key: key,
  value: JSON.stringify({
  timestamp: new Date().toISOString(),
  sensorid: sensorid,
  temperature: temp,
  geo: loc
})})

const sendMessage = async () => {
  try {
    const message = await producer
      .send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: Array(getNumMessages())
          .fill()
          .map(_ => createMessage(getKey(), getRandomTemp(), getSensorId(), getGeo())),
      });
    return console.log(message);
  } catch (e) {
    return console.error(`[example/producer] ${e.message}`, e);
  }
}

const run = async () => {
  await producer.connect()
  setInterval(sendMessage, 100)
}

run().catch(e => console.error(`[example/producer] ${e.message}`, e))
