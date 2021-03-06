'use strict';

const AWS = require('aws-sdk');
const SES = new AWS.SES();

module.exports.contact = (event, context, callback) => {
  const formData = JSON.parse(event.body);

  // Honeypot field was filled out, do nothing.
  if (formData.vip_field) return;

  sendEmail(formData, function (err, data) {
    const response = {
      statusCode: err ? 422 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: err ? err.message : data,
      }),
    };

    callback(null, response);
  });
};

/**
 * Build Message & Send email
 * 
 * @param {*} formData 
 * @param {*} callback 
 */
function sendEmail(formData, callback) {

  const {
    first_name,
    last_name,
    company,
    email,
    message,
    phone,
    domain
  } = formData;

  let subject = domain + ' Contact Form Submission';

  let body = `Message sent from: ${domain}

      Name: ${first_name + ' ' + last_name}
      Company: ${company}
      E-Mail: ${email}
      Phone #: ${phone}

      Message: ${message}`;

  let params = {
    Source: process.env.VERIFIED_EMAIL,
    ReplyToAddresses: [email],
    Destination: {
      ToAddresses: [process.env.VERIFIED_EMAIL]
    },
    Message: {
      Body: {
        Text: {
          Data: body,
          Charset: 'UTF-8'
        }
      },
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      }
    },
  };

  SES.sendEmail(params, callback);
}
