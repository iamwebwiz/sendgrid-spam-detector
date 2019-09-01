const express = require('express');
const sendgrid = require('@sendgrid/mail');
const faker = require('faker');
const http = require('https');
const app = express();
require('dotenv').config();
const port = process.env.APP_PORT || 4000;

// Serve app on port
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

// Set sendgrid api key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

// parse application/json
app.use(express.json());

/**
 * Send email to address using Sendgrid
 *
 * @param {string} emailAddress
 */
function sendMail(emailAddress) {
  app.post('/sendmail/sendgrid', (req, res) => {
    // configure message to send
    const message = {
      to: emailAddress,
      from: {
        email: process.env.MAIL_FROM_ADDRESS,
        name: process.env.MAIL_FROM_NAME,
      },
      subject: faker.lorem.sentence(),
      content: [{type: 'text/html', value: faker.lorem.paragraph()}],
      mail_settings: {
        spam_check: {
          enable: true,
          threshold: 10,
          post_to_url: `http://localhost:${port}`,
        },
      },
    };

    // Send message to email address
    sendgrid
      .send(message)
      .then(() => {
        // get spam reports
        let spamReports = checkSpamReports(emailAddress);

        res.json({
          status: 'success',
          message: 'Message sent successfully',
          recipient: message.to,
          spam_reports: spamReports > 0 ? spamReports : 'no spam reports',
        });
      })
      .catch(err => {
        res.json({
          error: err,
        });
      });
  });
}

/**
 * Check spam reports for an email address
 *
 * @param {string} email
 */
const checkSpamReports = email => {
  let options = {
    method: 'GET',
    hostname: 'api.sendgrid.com',
    port: null,
    path: `/v3/suppression/spam_reports/${email}`,
    headers: {
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
  };

  // make request
  let req = http.request(options, function (res) {
    let chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      return Buffer.concat(chunks);
    });
  });

  req.write('{}');
  req.end();
};

// Invoke function
sendMail(process.env.MAIL_TO_ADDRESS);
