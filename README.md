# aqi-notify

This is a simple program to fetch the current air quality index (AQI) from
airnow.gov, based on zip code, and send the AQI and time to an email address
(which may or may not forward to SMS).

### Requirements:
- SMTP server to send mail from (a gmail account will work)
- A server to run this program on (e.g. a Raspberry Pi or hosted VM)
  - with Node.js v12 or newer installed
- (If you want SMS) your cell carrier's email-to-sms address

### Usage:
1. Clone this repository
2. Install dependencies: `cd aqi-notify && yarn`
3. Create and configure a `.env` file in the root of the project.
   See below for an example file.
4. Create a cron job to run the program every hour. For example:
   ```
   30 * * * * export $(grep -v '^#' /path/to/aqi-notify/.env | xargs) && /path/to/aqi-notify/index.js >/dev/null 2>&1
   ```
   This will load the environment variables from the `.env` file and run `index.js` every hour at 30 past.

### Example `.env` file
```env
# Send notification only if the hour of reported data is within these times
# Hours are 00-23, both settings are inclusive
MIN_HOUR=6
MAX_HOUR=20

# Send notification only if AQI is greater than or equal to this threshold
# and hour of reported data is between MIN_HOUR and MAX_HOUR
AQI_THRESHOLD=50

# Send notification if AQI is greater than or equal to this threshold, regardless of *_HOUR settings
# Should be greater than AQI_THRESHOLD, or -1 to disable
AQI_OVERRIDE_THRESHOLD=100

# Location to check
ZIP_CODE=12345

# Comma-delimited list of addresses to send notification to
SEND_LIST=5551234567@text.some-carrier.com,5557654321@another-carrier.com

# SMTP credentials & configuration
SMTP_USER=username
SMTP_PASS=password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# API Key
AIR_NOW_API_KEY=uuid

# Log level, one of: debug, info, error
LOG_LEVEL=info
```
