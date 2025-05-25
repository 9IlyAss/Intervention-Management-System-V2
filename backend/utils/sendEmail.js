const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try{ // You can configure this with Gmail, SendGrid, or any SMTP
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password or actual password (use env!)
    }
  });

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
  await transporter.sendMail(mailOptions);
      console.log("message send")

}
  catch(error){
    console.log("error :",error)
  }
};

module.exports = sendEmail;
