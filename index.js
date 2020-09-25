#!/usr/bin/env node
'use strict';
require('dotenv').config();

const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const moment = require('moment');
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
  defaultMeta: { service: 'aqi-sms' },
  transports: [
    new transports.Console(),
    new transports.File({
      ...fileTransportOptions,
      filename: 'error.log',
      level: 'error',
    }),
    new transports.File({
      ...fileTransportOptions,
      filename: 'combined.log',
    }),
  ],
});

logger.debug(`Environment variables: ${JSON.stringify(process.env)}`);

async function main() {
  // Get AQI data
  const aqiResponse = await fetch(AIR_NOW_URL);
  const aqiData = await aqiResponse.json();
  logger.info(`Received AQI data response: ${JSON.stringify(aqiData)}`);
  if ('WebServiceError' in aqiData) process.exit(1);

  // Build message
  const time = moment(aqiData[0].HourObserved, 'HH').format('h:00 a');
  const message = `The AQI is ${aqiData[0].AQI} as of ${time}`;

  // Send text via email
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
  logger.info(`Message sent: "${message}"`);
  logger.debug(`Message info: ${JSON.stringify(info)}`);
}

main().catch(logger.error);
