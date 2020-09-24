# aqi-sms

This is a simple program to fetch the current air quality index (AQI) from airnow.gov, based on zip code,
and send a text message with the AQI and time to an email address (which may or may not forward to SMS).

### Requirements:
- SMTP server to send mail from
- A server to run this program on
- Node.js v12 or newer
- (If you want SMS) your cell carrier's email-to-sms address

### Usage:
- Create and configure a `.env` file in the root of the project. See `.env.example` for required fields.
- Create a cron job to run the program at your desired rate/times.
  For example, `15 7-19 * * * /path/to/index.js` (15 after the hour as airnow.gov updates approximately on the hour).
