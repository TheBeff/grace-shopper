const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport('smtps://testingfsa50@gmail.com:testingfsa2016@smtp.gmail.com');

const mailOptions = {
  from: '"Grace Shopper Customer Support" <gscs@graceshopper.com>', // sender address
};

function sendConfirmation(customerInfo, type) {
  mailOptions.to = customerInfo.email;
  _setEmailTemplate(customerInfo, type);

  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });

}

module.exports = sendConfirmation;

function _setEmailTemplate(customerInfo, type) {
  if (type === 'order') {
    mailOptions.subject = `Confirmation For Order #${ customerInfo.orderId }`
    mailOptions.html =
      `<p>Hello!</p>
      <p>Thank you for shopping with us. We’ll send a confirmation when your item ships.</p>
      <p>Your order number is ${ customerInfo.orderId }.</p>
      `
  }

  if (type === 'signup') {
    mailOptions.subject = `GraceShopper Account Created!`
    mailOptions.html =
      `<p>Hello!</p>
      <p>Thank you for creating a new account with GraceShopper!</p>
      <p>Your user login is ${ customerInfo.email }.</p>
      `
  }

  if (type === 'reset') {
    mailOptions.subject = `GraceShopper Password Reset Link`
    mailOptions.html =
      `<p>Hello!</p>
      <p>Please visit this link: www.localhost:1337/reset/${ customerInfo.resetPasswordToken }</p>
      <p>To reset your password. If you did not trigger this reset do not follow that link!</p>
      `
  }
}
