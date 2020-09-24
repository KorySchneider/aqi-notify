#!/usr/bin/env node
'use strict';
require('dotenv').config();

const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const moment = require('moment');

const {
  SMTP_USER,
  SMTP_PASS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SEND_ADDR,
  ZIP_CODE,
  AIR_NOW_API_KEY,
} = process.env;

const AIR_NOW_URL = `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&API_KEY=${AIR_NOW_API_KEY}&zipCode=${ZIP_CODE}`;

async function main() {
  // Get AQI data
  const aqiResponse = await fetch(AIR_NOW_URL);
  const aqiData = await aqiResponse.json();
  if (!aqiData) return;

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
  console.log('Message sent:', message, info.messageId);
}

main().catch(console.error);
