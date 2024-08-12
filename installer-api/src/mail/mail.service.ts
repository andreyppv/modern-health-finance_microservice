import {  Injectable } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { config } from 'dotenv';
config();

@Injectable()
export class MailService {
  data = [{
    filename: 'image.jpg',          
    type : "image/png",
    content: "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",
    content_id: "myimagecid",
    disposition : "inline"
  }]

  html1 = `
  <!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title></title>
   </head>
   <body>
      <table style="border:1px solid #fe932a; background-color: #fff;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;padding: 20px;margin: auto; width: 650px;border-radius:8px;border-top:6px solid #fe932a;">
         <tr>
            <td></td>
         </tr>
         <tr>
           <td colspan="7" height="50px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif; " align="center"><img  style="width: 200px;" src="cid:myimagecid"></td>
         </tr>`

    html2 = `<tr>
    <td colspan="7" >   
        <h4 style="color: #868686;font-weight: 600;font-size: 17px;font-family: Arial, sans-serif;"> By Team ${process.env.title}</h4>  
    </td>
  </tr>

</table>
</body>

</html>`
  constructor(@InjectSendGrid() private readonly client: SendGridService) {} 
  
  async passwordResetMail(Email, link) {
    try {
      const body = "Hi\nYou requested to reset your password.\nPlease, click the link below to reset your password\n";

      await this.client.send(
        {

          to: Email,
          from: process.env.FromMail,
          subject: process.env.title+' Reset password',
          text: body,
          attachments: this.data,
          html: this.html1+`    
          <tr>
           <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
           Reset password
           </td>
         </tr>
         <tr>
           
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Hi
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             You requested to reset your password.
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Please, click the link below to reset your password
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             <a href="${link}">Reset Password</a>
             </p>   
             
              </td>
         </tr>
            `+this.html2,
          
        }
      );
      console.log('pw reset sent successfully');

    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }

  async add(Email, password, url) {
    const body = "Email:" + Email + "\nPassword:" + password + "\nVerify To Your Email:" + url
    try {
      await this.client.send(
        {

          to: Email,
          from: process.env.FromMail,
          subject: process.env.title+' Login Details',
          text: body,
          attachments: this.data,
          html: this.html1+`    
          <tr>
           <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
           Login Details
           </td>
         </tr>
         <tr>
           
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Email : ${Email}
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Password : ${password}
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             <a href="${url}">Click here to verify your email</a>
             </p>   
             
              </td>
         </tr>
            `+this.html2,
        }
      );
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }

  async sendOtp(email, otp) {
    try {
      const body = `
      <h2>${process.env.title}</h2>
      <p>To authenticate, please use the following One Time Password(OTP).</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for only 5 min.</p>
      <p>Thank you</p>
      `;
      await this.client.send(
        {
          to: email,
          from: process.env.FromMail,
          subject: process.env.title+' Login Auth',
          text: body,
          attachments: this.data,
          html: this.html1+`    
          <tr>
           <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
           ${process.env.title}
           </td>
         </tr>
         <tr>
           
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             To authenticate, please use the following One Time Password(OTP).
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             ${otp}
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             This OTP is valid for only 5 min.
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Thank you
             </p>   
             
              </td>
         </tr>
            `+this.html2,
        }
      );
      console.log('Two factor auth email sent successfully');
    } catch (error) {
      console.error('Error sending two factor auth email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }

  async comments(Email, subject, comment) {
    try {
      const body = comment+"\n";
      await this.client.send(
        {

          to: Email,
          from: process.env.FromMail,
          subject: subject,
          text: body,
          attachments: this.data,
          html: this.html1+`   
          <tr>
           <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
           ${process.env.title} message
           </td>
         </tr>
         <tr>
           
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             ${comment}
             </p> 
             
             
              </td>
         </tr>
            `+this.html2,
        }
      );
      console.log('mail sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }
  
}