# aqi-sms

This is a simple program to fetch the current air quality index (AQI) from
airnow.gov, based on zip code, and send the AQI and time to an email address
(which may or may not forward to SMS).

### Requirements:
- SMTP server to send mail from (a gmail account will work)
- A server to run this program on
- Node.js v12 or newer
- (If you want SMS) your cell carrier's email-to-sms address

### Usage:
- Create and configure a `.env` file in the root of the project.
  See `.env.example` for required fields
- Create a cron job to run the program at your desired rate/times. For example,
  `15 0-2,13-23 * * * export $(grep -v '^#' /path/to/aqi-sms/.env | xargs) && /path/to/aqi-sms/index.js >/path/to/aqi-sms/cron.log 2>&1`.
  This will load the environment variables from the `.env` file and run
  `index.js` every hour from 7:15 to 20:15 PST, on a UTC server.
