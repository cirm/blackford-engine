const mq = require('amqplib');
const logger = require('../utilities/winston');
const orders = require('./orders');
const objects = require('./objects');

const queues = [
  'payments',
  'boosts',
  'looting',
  'objects',
  'exploration',
  'orders',
  'balance',
];

let channel = false;
let connectedMq = false;

const initMq = async () => {
  try {
    connectedMq = await mq.connect('amqp://localhost');
  } catch (e) {
    logger.error(`Error creating MQ connection: ${e}`);
  }
  try {
    channel = await connectedMq.createChannel();
  } catch (e) {
    logger.error(`Error creating MQ channel: ${e}`);
  }
  try {
    await queues.forEach(q => channel.assertQueue(q, { durable: true }));
    channel.prefetch(1);
    channel.consume('orders', (msg) => { orders.orderConsumer(msg, channel); }, { noAck: false });
    channel.consume('objects', (msg) => { objects.objectConsumer(msg, channel); }, { noAck: false });
  } catch (e) {
    logger.error(`Error confirming MQ queue: ${e}`);
  }
};

module.exports = {
  initMq,
  sendToQueue: async (q, msg) => {
    if (channel) {
      channel.sendToQueue(q, Buffer.from(JSON.stringify(msg)), { deliveryMode: true });
    }
  },
  assertQueue: async q => channel.assertQueue(q, { durable: true }),
};
