# sendgrid spam detector

> Send email using sendgrid and fetch spam reports related to the email address

### Setup

Clone the repository and navigate into the directory

```bash
git clone https://github.com/iamwebwiz/sendgrid-spam-detector.git && cd sendgrid-spam-detector
```

Install dependencies

```bash
npm install
```

Setup application

```bash
npm run app:setup
```

Copy the following to `.env`

```
APP_PORT=4000
MAIL_TO_ADDRESS=
MAIL_FROM_ADDRESS=test@mail.com
MAIL_FROM_NAME='Test User'
SENDGRID_API_KEY=
```

Set the value of `SENDGRID_API_KEY` to the API key gotten from Sendgrid's dashboard

Run the app

```bash
npm run app:start
```

Launch Postman and fire up a `POST` request to http://localhost:{PORT}/sendmail/sendgrid
