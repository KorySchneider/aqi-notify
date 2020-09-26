#!/usr/bin/env node
'use strict';
require('dotenv').config();

const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const winston = require('winston');

const {
  SMTP_USER,
  SMTP_PASS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SEND_ADDR,
  ZIP_CODE,
  AIR_NOW_API_KEY,
  LOG_LEVEL,
  AQI_THRESHOLD,
  MIN_HOUR,
  MAX_HOUR,
} = process.env;

const AIR_NOW_URL = `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&API_KEY=${AIR_NOW_API_KEY}&zipCode=${ZIP_CODE}`;

const { createLogger, transports } = winston;
const { combine, timestamp, printf } = winston.format;
const fileTransportOptions = {
  maxsize: 50000000, // 50mb
  maxFiles: 1,
  tailable: true,
};

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({level, message, label, timestamp}) => (
      `${timestamp} ${level.toUpperCase()}: ${message}\n`
    )),
  ),
  defaultMeta: { service: 'aqi-notify' },
  transports: [
    new transports.Console(),
    new transports.File({
      ...fileTransportOptions,
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({
      ...fileTransportOptions,
      filename: 'logs/combined.log',
    }),
  ],
});

logger.debug(`Environment variables: ${JSON.stringify(process.env)}`);

async function main() {
  // Get AQI data
  const aqiResponse = await fetch(AIR_NOW_URL);
  const aqiData = await aqiResponse.json();
  logger.info(`Received AQI data response: ${JSON.stringify(aqiData)}`);

  if ('WebServiceError' in aqiData) {
    logger.error(`Exiting due to API error: ${JSON.stringify(aqiData)}`);
    process.exit(1);
  }

  // Check AQI
  const AQI = aqiData[0].AQI;
  if (AQI < AQI_THRESHOLD) {
    logger.info('Exiting because AQI was below AQI_THRESHOLD');
    process.exit(0);
  }

  // Check time
  let hour = aqiData[0].HourObserved;
  if (hour <= MIN_HOUR || hour >= MAX_HOUR) {
    logger.info('Exiting because hour is outside desired range');
    process.exit(0);
  }

  // Build message
  hour++;
  const time = hour > 12 ? `${hour - 12} pm` : `${hour} am`;
  const message = `The AQI is ${AQI} as of ${time}`;
  logger.info(`Message to send: "${message}"`);

  // Send message
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: SMTP_USER,
    to: SEND_ADDR,
    text: message,
  });
  logger.debug(`Message info: ${JSON.stringify(info)}`);
}

main().catch(err => logger.error(`Error in main(): ${err}`));
