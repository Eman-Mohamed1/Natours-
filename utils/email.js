const nodemailer = require('nodemailer');

const sendEmail =  async options => {
    // 1) create a transporter 


    const transporter=nodemailer.createTransporter ({
        //Gmail is not a good way cause if u send a lot of emails maybe they defind u as a spam so we use dev tool mailtrap (create an account) 
        // service:'Gmail',
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    // 2) Define the email options 
        const mailOptions={
            from:'emanm.farrag20@yahoo.com', //prosses.env??
            to:options.email,
            subject:options.subject,
            text:options.message,
            // html:

        }

    // 3) Actually send the email

    await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;

