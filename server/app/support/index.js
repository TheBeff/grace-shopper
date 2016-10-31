const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport('smtps://testingfsa50@gmail.com:testingfsa2016@smtp.gmail.com');

const mailOptions = {
    from: '"Grace Shopper Customer Support" <gscs@graceshopper.com>', // sender address
    html: '<b>Hello world</b>' // html body
};

function sendConfirmation(customerInfo) {
  mailOptions.to = customerInfo.email;
  mailOptions.subject = `Order #${ customerInfo.orderNumber } Shipping Confirmation`

  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });

}

module.exports = sendConfirmation;
