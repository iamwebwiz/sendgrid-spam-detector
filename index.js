const express = require("express");
const sendgrid = require("@sendgrid/mail");
const faker = require("faker");
const http = require("https");
const app = express();
require("dotenv").config();
const port = process.env.APP_PORT || 3000;

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

/**
 * Send email to address using Sendgrid
 *
 * @param {string} emailAddress
 */
function sendMail(emailAddress) {
  app.post("/sendmail/sendgrid", (req, res) => {
    const message = {
      to: emailAddress,
      from: {
        email: process.env.MAIL_FROM_ADDRESS,
        name: process.env.MAIL_FROM_NAME
      },
      subject: faker.lorem.sentence(),
      content: [{ type: "text/html", value: faker.lorem.paragraph() }],
      mail_settings: {
        spam_check: {
          enable: false,
          threshold: 10,
          post_to_url: ""
        }
      }
    };

    sendgrid
      .send(message)
      .then(() => {
        let spamReports = checkSpamReports(emailAddress);

        res.json({
          status: "success",
          message: "Message sent successfully",
          recipient: message.to,
          spam_reports: spamReports > 0 ? spamReports : "no spam reports"
        });
      })
      .catch(err => {
        res.json({
          error: err
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
    method: "GET",
    hostname: "api.sendgrid.com",
    port: null,
    path: `/v3/suppression/spam_reports/${email}`,
    headers: {
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
    }
  };

  let req = http.request(options, function(res) {
    let chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });

    res.on("end", function() {
      let body = Buffer.concat(chunks);
      return body;
    });
  });

  req.write("{}");
  req.end();
};

// Invoke function
sendMail(process.env.MAIL_TO_ADDRESS);