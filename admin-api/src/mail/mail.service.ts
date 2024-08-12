import { Injectable } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { getManager } from 'typeorm';
import { config } from 'dotenv';
config();

@Injectable()
export class MailService {
  //@InjectSendGrid() private readonly client: SendGridService;
  companyName: string = 'Modern Health Finance';
  constructor(@InjectSendGrid() private readonly client: SendGridService) {}
  data = [
    {
      filename: 'image.jpg',
      type: 'image/png',
      content:
        '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',
      content_id: 'myimagecid',
      disposition: 'inline',
    },
  ];

  html1 = `
  <!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title></title>
   </head>
   <body>
      <table style="border:1px solid #C5D93B; background-color: #fff;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;padding: 20px;margin: auto; width: 650px;border-radius:8px;border-top:6px solid #C5D93B;">
         <tr>
            <td></td>
         </tr>
         <tr>
           <td colspan="7" height="50px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif; " align="center"><img  style="width: 200px;" src="cid:myimagecid"></td>
         </tr>`;

  html2 = `<tr>
    <td colspan="7" >   
        <h4 style="color: #868686;font-weight: 600;font-size: 17px;font-family: Arial, sans-serif;"> By Team ${process.env.title}</h4>  
    </td>
  </tr>

</table>
</body>

</html>`;

  async createPractice(email, url, name) {
    try {
      await this.client.send({
        to: email,
        from: process.env.FromMail,
        subject: `${this.companyName} Invite Link`,
        attachments: this.data,
        html: `
        <table style="border:1px solid #70a54a; background-color: #fff;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;padding: 20px;margin: auto; width: 650px;border-radius:8px;border-top:6px solid #70a54a;">
        <tr>
            <td></td>
        </tr>
        <tr>
            <td colspan="7" height="50px"
                style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif; "
                align="center">
                <img style="width: 200px;" src="cid:myimagecid">
            </td>
        </tr>
        <tr>
            <td colspan="7" height="50px"
                style="font-size: 20px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
                HI,${name}</td>
        </tr>
        <tr>
            <td style=" line-height: 30px;font-size: 17px;font-weight: 600;color:#858399; font-family: Arial, sans-serif;">
                Thanks for registering with Modern Health Finance.<br>
                Please click button to login to Modern Health Finance for more details.
            </td>
        </tr>
        <tr>
            <td style=" line-height: 30px;font-size: 17px;font-weight: 600;color:#858399; font-family: Arial, sans-serif; height:60px">
                <a href="${url}"
                    style="width:150px; background:#70a54a; color:#fff; border-radius:5px;     padding: 10px 30px;    text-decoration: none;">
                    Login</a>
            </td>
        </tr>
        <tr>
            <td
                style=" line-height: 30px;font-size: 17px;font-weight: 600;color:#858399; font-family: Arial, sans-serif;">
                Thank you,<br>


                Modern Health Finance Team<br>

                <a href="${url}" style="color:#70a54a"> Login Here</a><br>

                <a href="mailto:contact@modernhealthfinance.com"
                    style="color:#70a54a">contact@modernhealthfinance.com</a>
            </td>
        </tr>
    </table>
    </td>
    </tr>
    </table>
        `,
      });
      console.log('Practice email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async inviteEmail(Email, password, url) {
    const body =
      'Email:' +
      Email +
      '\nPassword:' +
      password +
      '\nVerify To Your Email:' +
      url;
    try {
      await this.client.send({
        to: Email,
        from: process.env.FromMail,
        subject: `${this.companyName} Invite Link`,
        text: body,
        html: `
            <table style="text-align:left;">
      <tr>
      <th >Email</th>
      <td>:</td>
      <td>${Email}</td>
      </tr>
      <tr>
      <th>password</th>
      <td>:</td>
      <td>${password}</td>
      </tr>
      <tr>
      <td colspan="3"><a href="${url}">Verify To Your Email</a></td>
      </tr>
      </table>
            `,
      });
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async add(Email, password, url) {
    const body =
      'Email:' +
      Email +
      '\nPassword:' +
      password +
      '\nVerify To Your Email:' +
      url;
    try {
      await this.client.send({
        to: Email,
        from: process.env.FromMail,
        subject: this.companyName + ' Login Details',
        text: body,
        html: `
            <table style="text-align:left;">
      <tr>
      <th >Email</th>
      <td>:</td>
      <td>${Email}</td>
      </tr>
      <tr>
      <th>password</th>
      <td>:</td>
      <td>${password}</td>
      </tr>
      <tr>
      <td colspan="3"><a href="${url}">Click To Login</a></td>
      </tr>
      </table>
            `,
      });
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async initial_note(Email, url) {
    const body = 'Email:' + Email + '\nSignature to Promissory Note:' + url;
    try {
      let data = await this.client.send({
        to: Email,
        from: process.env.FromMail,
        subject: 'Promissory Note',
        text: body,
        attachments: this.data,
        html:
          this.html1 +
          `    
          <tr>
           <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
           Promissory Note
           </td>
         </tr>
         <tr>
           
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Email : ${Email}
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             <a href="${url}">Click here to sign promissory note</a>
             </p> 
             
              </td>
         </tr>
            ` +
          this.html2,
      });
      console.log('Test email sent successfully', data);
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async mail(id: string, purposeOfTheMail: string) {
    const entityManager = getManager();
    const rawdata = await entityManager.query(
      "SELECT * FROM customer WHERE loan_id = '" + id + "'",
    );
    let emailFooter = '';
    let body = '';
    if (purposeOfTheMail == 'Invite' || purposeOfTheMail == 'Test') {
      body = ` <div class="emailBodyMessage">
        Congratulations!After revisiting our initial decision, you have new offer from ${this.companyName}<br><br><br/>
       <table align="center" cellpadding="0" cellspacing="0" width="80%" >
           <tr>
               <td align="center" valign="top">
                   <table border="1" cellpadding="0" cellspacing="0" width="100%" class="wrapper">
                       <tbody>
                           <tr>
                               <td align="center" valign="top">
                                   Financing Amount
                               </td>
                               <td align="center" valign="top">
                                   ${rawdata[0].loanamount}
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Monthly Payment
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].monthlypayment}
                                
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   APR
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].apr}%
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Number of payments
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].loanterm}
                               </td>
                           </tr>
                       </tbody>
                   </table>
               </td>
           </tr>
       </table>
       
   </div>`;
      emailFooter = `<div class="emailBodyMessage">
              <h3 style="font-weight: bold; font-size: 22px">Please complete the next steps on your loan application by clicking the link below.</h3>
              <div style="text-align:center">
                    <a class="button" href="${process.env.StagingURL}review/${id}">click here</a>
                    <br>OR<br>
                    <a  href="${process.env.StagingURL}review/${id}">${process.env.StagingURL}review/${id}</a>
              </div>
              </div>`;
    } else if (purposeOfTheMail == 'Welcome') {
      body = ` <div class="emailBodyMessage">
        Congratulations!After revisiting our initial decision,you have new offer from ${this.companyName}<br><br><br/>
       <table align="center" cellpadding="0" cellspacing="0" width="80%" >
           <tr>
               <td align="center" valign="top">
                   <table border="1" cellpadding="0" cellspacing="0" width="100%" class="wrapper">
                       <tbody>
                           <tr>
                               <td align="center" valign="top">
                                   Financing Amount
                               </td>
                               <td align="center" valign="top">
                                   ${rawdata[0].loanamount}
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Monthly Payment
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].monthlypayment}
                                
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   APR
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].apr}%
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Number of payments
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].loanterm}
                               </td>
                           </tr>
                       </tbody>
                   </table>
               </td>
           </tr>
       </table>
       
   </div>`;
      emailFooter = '';
    } else if (purposeOfTheMail == 'Pending') {
      body = `<p><center>Your application is completed and is now pending underwriter approval</center></p>`;
      emailFooter = '';
    } else if (purposeOfTheMail == 'Plaid Relogin') {
      body = '';
      emailFooter = `<div class="emailBodyMessage">
              <h3 style="font-weight: bold; font-size: 22px">Please complete the next steps on your loan application by clicking the link below.</h3>
              <div style="text-align:center">
                    <a class="button" href="${process.env.StagingURL}review/${id}">Connect Your Bank</a>
                    <br>OR<br>
                    <a  href="${process.env.StagingURL}review/${id}">${process.env.StagingURL}review/${id}</a>
              </div>
              </div>`;
    } else if (purposeOfTheMail == 'PromissoryNote') {
      body = '';
      emailFooter = `<div class="emailBodyMessage">
              <h3 style="font-weight: bold; font-size: 22px">Please complete the next steps on your loan application by clicking the link below.</h3>
              <div style="text-align:center">
                    <a class="button" href="${process.env.StagingURL}review/${id}">Contract Signature</a>
                    <br>OR<br>
                    <a  href="${process.env.StagingURL}review/${id}">${process.env.StagingURL}review/${id}</a>
              </div>
              </div>`;
    }
    let toEmail = '';
    if (purposeOfTheMail == 'Test') {
      toEmail = 'jaypriya.shanmugaraj@trustalchemy.com';
    } else {
      toEmail = rawdata[0].email;
    }
    await this.client.send({
      to: toEmail,
      from: process.env.FromMail,
      subject: `Modern Health Finance Invite Link`,

      html: `
      <html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width" />
  <style>
      .wrapper {
          border: 5px solid #eee;
          border-radius: 5px;
      }
      .emailHeader {
          width: auto;
          background-color: #002f6c;
          color: #FFF;
          height: 90px;
          max-height: 90px;
          text-align: center;
          padding: 10px;
          border-bottom: 4px solid #eb0029;
          font-size: 150%;
      }
      .practiceHeaderName {
          text-align: center;
          color: #FFF;
          font-size: 190%;
      }
      .button {
        background-color: #008CBA;
        border: none;
        color: white !important;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
      }
      .emailLogo {
          height: 40px;
          max-height: 40px;
          width: auto;
          margin-top: 5px;
          margin-bottom: 5px;
          color: rgb(47,97,183);
          font-size: 30px;
          font-weight: 700;
      }
      .emailLayout {
          margin: 0 auto;
          max-width: 600px;
          min-width: 320px;
          width: auto;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
      }
      .emailLayoutMargins {
          margin-bottom: 50px;
      }
      .emailSignature {
          margin-top: 30px;
          text-align: center;
          color: #60666d;
          font-size: 16px;
      }
      .emailBodyOuterDiv {
          color: #60666d;
          font-size: 16px;
          text-align: center;
      }
      .emailGreetings {
          margin-bottom: 30px;
          font-style: normal;
          font-weight: normal;
          color: #60666d;
          font-size: 20px;
          text-align: center;
      }
      .btn-application {
          font-size: 14px;
          webkit-font-smoothing: antialiased;
          cursor: pointer;
          -moz-user-select: none;
          -webkit-user-select: none;
          -o-user-select: none;
          user-select: none;
          display: inline-block;
          font-weight: normal;
          text-align: center;
          text-decoration: none;
          -moz-transition: all .4s ease;
          -webkit-transition: all .4s ease;
          -o-transition: all .4s ease;

          background-color: #002f6c;

          border-radius: 6px;
          border-width: 0px;
          color: rgb(255,255,255);
          font-family: sans-serif;
          height: auto;
          transition: all .4s ease;
          padding: 8px 20px;
          text-shadow: none;
          width: auto;
          line-height: 1.5em;
      }
      .emailBold {
          font-weight: 700;
      }

  table, th, td {
    border: 1px solid black;
  }
  td {
    padding: 5px;
  }
  table {
    margin: auto;
    width: 70%;
    border-collapse: collapse;
  }
  p {
    text-align: left;
    color: #60666d;
  }
  </style>
  <style>
      @media (max-width: 721px) {
          .emailHeader {
              max-height: 700px;
          }
          .modernHealthName {
              font-size: 50%;
          }
          .practiceHeaderName {
              font-size: 80%;
          }
      }
  </style>
</head>

<div class="wrapper">
  <div class="emailHeader">
      <div class="emailHeaderLogo">
          <span class="modernHealthName">${this.companyName}</span>
      </div>
      
  </div>
  <div class="emailLayout">
      <div class="emailLayoutMargins">
          <div class="emailBodyOuterDiv">
      <h2 class="emailGreetings">Hi ${rawdata[0].firstname} ${rawdata[0].middlename} ${rawdata[0].lastname}</h2>
  </div>  
            ${body}
            ${emailFooter}
          <div class="emailSignature">
              Thank you,<br /><br>
             ${process.env.HelpMail}
          </div>
      </div>
  </div>
</div>
</html> `,
    });
  }
  async testMail(id: string, purposeOfTheMail: string, email: string) {
    const entityManager = getManager();
    const rawdata = await entityManager.query(
      "SELECT * FROM customer WHERE loan_id = '" + id + "'",
    );
    let emailFooter = '';
    if (purposeOfTheMail == 'Test') {
      emailFooter = `<div class="emailBodyMessage">
              <h3 style="font-weight: bold; font-size: 22px">Please complete the next steps on your loan application by clicking the link below.</h3>
              <a class="button" href="${process.env.StagingURL}review/${id}">click here</a>
              <a  href="${process.env.StagingURL}review/${id}">${process.env.StagingURL}review/${id}</a>
          </div>`;
    }

    await this.client.send({
      to: email,
      from: process.env.FromMail,
      subject: `Modern Health Finance Invite Link`,

      html: `
      <html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width" />
  <style>
      .wrapper {
          border: 5px solid #eee;
          border-radius: 5px;
      }
      .emailHeader {
          width: auto;
          background-color: #002f6c;
          color: #FFF;
          height: 90px;
          max-height: 90px;
          text-align: center;
          padding: 10px;
          border-bottom: 4px solid #eb0029;
          font-size: 150%;
      }
      .button {
        background-color: #008CBA; 
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
      }
      .practiceHeaderName {
          text-align: center;
          color: #FFF;
          font-size: 190%;
      }
      .emailLogo {
          height: 40px;
          max-height: 40px;
          width: auto;
          margin-top: 5px;
          margin-bottom: 5px;
          color: rgb(47,97,183);
          font-size: 30px;
          font-weight: 700;
      }
      .emailLayout {
          margin: 0 auto;
          max-width: 600px;
          min-width: 320px;
          width: auto;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
      }
      .emailLayoutMargins {
          margin-bottom: 50px;
      }
      .emailSignature {
          margin-top: 30px;
          text-align: center;
          color: #60666d;
          font-size: 16px;
      }
      .emailBodyOuterDiv {
          color: #60666d;
          font-size: 16px;
          text-align: center;
      }
      .emailGreetings {
          margin-bottom: 30px;
          font-style: normal;
          font-weight: normal;
          color: #60666d;
          font-size: 20px;
          text-align: center;
      }
      .btn-application {
          font-size: 14px;
          webkit-font-smoothing: antialiased;
          cursor: pointer;
          -moz-user-select: none;
          -webkit-user-select: none;
          -o-user-select: none;
          user-select: none;
          display: inline-block;
          font-weight: normal;
          text-align: center;
          text-decoration: none;
          -moz-transition: all .4s ease;
          -webkit-transition: all .4s ease;
          -o-transition: all .4s ease;

          background-color: #002f6c;

          border-radius: 6px;
          border-width: 0px;
          color: rgb(255,255,255);
          font-family: sans-serif;
          height: auto;
          transition: all .4s ease;
          padding: 8px 20px;
          text-shadow: none;
          width: auto;
          line-height: 1.5em;
      }
      .emailBold {
          font-weight: 700;
      }

  table, th, td {
    border: 1px solid black;
  }
  td {
    padding: 5px;
  }
  table {
    margin: auto;
    width: 70%;
    border-collapse: collapse;
  }
  p {
    text-align: left;
    color: #60666d;
  }
  </style>
  <style>
      @media (max-width: 721px) {
          .emailHeader {
              max-height: 700px;
          }
          .modernHealthName {
              font-size: 50%;
          }
          .practiceHeaderName {
              font-size: 80%;
          }
      }
  </style>
</head>

<div class="wrapper">
  <div class="emailHeader">
      <div class="emailHeaderLogo">
          <span class="modernHealthName">${this.companyName}</span>
      </div>
      
  </div>
  <div class="emailLayout">
      <div class="emailLayoutMargins">
          <div class="emailBodyOuterDiv">
      <h2 class="emailGreetings">Hi ${rawdata[0].firstname} ${rawdata[0].middlename} ${rawdata[0].lastname}</h2>

      <div class="emailBodyMessage">
           Congratulations!After revisiting our initial decision,you have new offer from ${this.companyName}<br><br><br/>
          <table align="center" cellpadding="0" cellspacing="0" width="80%" >
              <tr>
                  <td align="center" valign="top">
                      <table border="1" cellpadding="0" cellspacing="0" width="100%" class="wrapper">
                          <tbody>
                              <tr>
                                  <td align="center" valign="top">
                                      Financing Amount
                                  </td>
                                  <td align="center" valign="top">
                                      ${rawdata[0].loanamount}
                                  </td>
                              </tr>
                              <tr>
                                  <td align="center" valign="top">
                                      Monthly Payment
                                  </td>
                                  <td align="center" valign="top">
                                  ${rawdata[0].monthlypayment}
                                   
                                  </td>
                              </tr>
                              <tr>
                                  <td align="center" valign="top">
                                      APR
                                  </td>
                                  <td align="center" valign="top">
                                  ${rawdata[0].apr}%
                                  </td>
                              </tr>
                              <tr>
                                  <td align="center" valign="top">
                                      Number of payments
                                  </td>
                                  <td align="center" valign="top">
                                  ${rawdata[0].loanterm}
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
          </table>
          
      </div>
  </div>
            ${emailFooter}
          <div class="emailSignature">
              Thank you,<br /><br>
             ${process.env.HelpMail}
          </div>
      </div>
  </div>
</div>
</html> `,
    });
  }

  async sendOtp(email, otp) {
    try {
      const body = `
      <h2>${this.companyName}</h2>
      <p>To authenticate, please use the following One Time Password(OTP).</p>
      <h3>${otp}</h3>
      <p>This OTP is valid for only 5 min.</p>
      <p>Thank you</p>
      `;
      await this.client.send({
        to: email,
        from: process.env.FromMail,
        subject: `Modern Health Login Auth`,
        text: body,
        html: `
            <h2>${this.companyName}</h2>
            <p>To authenticate, please use the following One Time Password(OTP).</p>
            <h3>${otp}</h3>
            <p>This OTP is valid for only 5 min.</p>
            <p>Thank you</p>
            `,
      });
      console.log('Two factor auth email sent successfully');
    } catch (error) {
      console.error('Error sending two factor auth email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async passwordResetMail(Email, link) {
    try {
      const body =
        'Hi\nYou requested to reset your password.\nPlease, click the link below to reset your password\n';

      await this.client.send({
        to: Email,
        from: process.env.FromMail,
        subject: `${this.companyName} Reset password`,
        text: body,
        html: `
            <p>Hi</p>
            <p>You requested to reset your password.</p>
            <p>Please, click the link below to reset your password</p>
            <a href="${link}">Reset Password</a>
            `,
      });
      console.log('pw reset sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async invitePromissoryNote(email, html) {
    try {
      const body = `
      <h2>${this.companyName}</h2>
      <p>To Read the following contents and sign the promisssory note.</p>
      <h3>${html}</h3>
      <p>Thank you</p>
      `;
      await this.client.send({
        to: email,
        from: process.env.FromMail,
        subject: `${this.companyName} Promissory Note`,
        text: body,
        html: `
        <h2>${this.companyName}</h2>
        <p>To Read the following contents and sign the promisssory note.</p>
        <h3>${html}</h3>
        <p>Thank you</p>
            `,
      });
      console.log('Promissory Note email sent successfully');
    } catch (error) {
      console.error('Error sending two factor auth email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async sendCommentToCustomer(id, user_email, subject, comment) {
    const emailFooter = '';
    const body = ` <div class="emailBodyMessage">
       <table align="center" cellpadding="0" cellspacing="0" width="80%" >
           <tr>
               <td align="center" valign="top">
                   <table border="1" cellpadding="0" cellspacing="0" width="100%" class="wrapper">
                       <tbody>
                           <tr>
                               <td align="center" valign="top">
                                   Subject
                               </td>
                               <td align="center" valign="top">
                                   ${subject}
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Comment
                               </td>
                               <td align="center" valign="top">
                               ${comment}
                                
                               </td>
                           </tr>
                           
                       </tbody>
                   </table>
               </td>
           </tr>
       </table>
       
   </div>`;
    const entityManager = getManager();
    try {
      const rawdata = await entityManager.query(
        "SELECT * FROM customer WHERE loan_id = '" + id + "'",
      );
      await this.client.send({
        to: user_email,
        from: process.env.FromMail,
        subject: `Modern Health Finance Info`,
        text: body,
        //attachments: this.data,
        html: `
      <html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width" />
  <style>
      .wrapper {
          border: 5px solid #eee;
          border-radius: 5px;
      }
      .emailHeader {
          width: auto;
          background-color: #002f6c;
          color: #FFF;
          height: 90px;
          max-height: 90px;
          text-align: center;
          padding: 10px;
          border-bottom: 4px solid #eb0029;
          font-size: 150%;
      }
      .practiceHeaderName {
          text-align: center;
          color: #FFF;
          font-size: 190%;
      }
      .button {
        background-color: #008CBA;
        border: none;
        color: white !important;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
      }
      .emailLogo {
          height: 40px;
          max-height: 40px;
          width: auto;
          margin-top: 5px;
          margin-bottom: 5px;
          color: rgb(47,97,183);
          font-size: 30px;
          font-weight: 700;
      }
      .emailLayout {
          margin: 0 auto;
          max-width: 600px;
          min-width: 320px;
          width: auto;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
      }
      .emailLayoutMargins {
          margin-bottom: 50px;
      }
      .emailSignature {
          margin-top: 30px;
          text-align: center;
          color: #60666d;
          font-size: 16px;
      }
      .emailBodyOuterDiv {
          color: #60666d;
          font-size: 16px;
          text-align: center;
      }
      .emailGreetings {
          margin-bottom: 30px;
          font-style: normal;
          font-weight: normal;
          color: #60666d;
          font-size: 20px;
          text-align: center;
      }
      .btn-application {
          font-size: 14px;
          webkit-font-smoothing: antialiased;
          cursor: pointer;
          -moz-user-select: none;
          -webkit-user-select: none;
          -o-user-select: none;
          user-select: none;
          display: inline-block;
          font-weight: normal;
          text-align: center;
          text-decoration: none;
          -moz-transition: all .4s ease;
          -webkit-transition: all .4s ease;
          -o-transition: all .4s ease;

          background-color: #002f6c;

          border-radius: 6px;
          border-width: 0px;
          color: rgb(255,255,255);
          font-family: sans-serif;
          height: auto;
          transition: all .4s ease;
          padding: 8px 20px;
          text-shadow: none;
          width: auto;
          line-height: 1.5em;
      }
      .emailBold {
          font-weight: 700;
      }

  table, th, td {
    border: 1px solid black;
  }
  td {
    padding: 5px;
  }
  table {
    margin: auto;
    width: 70%;
    border-collapse: collapse;
  }
  p {
    text-align: left;
    color: #60666d;
  }
  </style>
  <style>
      @media (max-width: 721px) {
          .emailHeader {
              max-height: 700px;
          }
          .modernHealthName {
              font-size: 50%;
          }
          .practiceHeaderName {
              font-size: 80%;
          }
      }
  </style>
</head>

<div class="wrapper">
  <div class="emailHeader">
      <div class="emailHeaderLogo">
          <span class="modernHealthName">${this.companyName}</span>
      </div>
      
  </div>
  <div class="emailLayout">
      <div class="emailLayoutMargins">
          <div class="emailBodyOuterDiv">
      <h2 class="emailGreetings">Hi ${rawdata[0].firstname} ${rawdata[0].middlename} ${rawdata[0].lastname}</h2>
  </div>  
            ${body}
            ${emailFooter}
          <div class="emailSignature">
              Thank you,<br /><br>
             ${process.env.HelpMail}
          </div>
      </div>
  </div>
</div>
</html> `,
      });
      console.log('Comment to customer email sent successfully');
    } catch (error) {
      console.error('Error sending Comment to customer email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
  async emailVerification(email, url, name) {
    try {
      await this.client.send({
        to: email,
        from: process.env.FromMail,
        subject: `${this.companyName} Invite Link`,
        html: `
            <table style="text-align:left;">
              <tr>
                <th >Hi ${name}</th>
                <td>:</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3"><a href="${url}">Verify To Your Email</a></td>
              </tr>
            </table>
            `,
      });
      console.log(' email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async mail1(id: string, purposeOfTheMail: string) {
    const entityManager = getManager();
    let rawdata = await entityManager.query(
      `select t."firstname" as "firstname",t."loanamount" as "loanamount",t."practiceid" as "practiceid", t.apr as apr,t."procedure_startdate" as "procedure_startdate", t."loanterm" as "loanterm",t2.interest as interest, t2."scheduledate" as "scheduledate", t2.amount as amount, t.email as email from customer t
          join paymentschedule t2 on t.loan_id = t2.loan_id where t.loan_id='${id}' `,
    );
    console.log(rawdata);
    let data1 = await entityManager.query(
      `select "practicename" from practice where id = '${rawdata[0].practiceid}'`,
    );
    let emailFooter = '';
    let body = '';

    if (purposeOfTheMail == 'Welcome') {
      body = ` <div class="emailBodyMessage">
      <div class ="header">
      
        Congratulations! We've received notice that you have an effective upcoming service start date with 
        ${data1[0].practiceName} financing details:<br><br><br/>
      
                   <table border="1" cellpadding="0" cellspacing="0" width="80%" style ="color:black">
                       <tbody>
                           <tr>
                               <td align="center" valign="top">
                                   Financing Amount
                               </td>
                               <td align="center" valign="top">
                                   ${rawdata[0].loanamount}
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Monthly Payment
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].amount.toFixed(2)}
                                
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Practice Name
                               </td>
                               <td align="center" valign="top">
                                 ${data1[0].practiceName}
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Contract Date (Your Service Date)
                               </td>
                               <td align="center" valign="top">
                                   ${
                                     rawdata[0].procedure_startdate
                                       .toISOString()
                                       .split('T')[0]
                                   }
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   1st Payment Due Date
                               </td>
                               <td align="center" valign="top">
                                   ${
                                     rawdata[0].scheduledate
                                       .toISOString()
                                       .split('T')[0]
                                   }
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   APR
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].apr}%
                               </td>
                           </tr>
                           <tr>
                               <td align="center" valign="top">
                                   Number of payments
                               </td>
                               <td align="center" valign="top">
                               ${rawdata[0].loanterm}
                               </td>
                           </tr>
                       </tbody>
                   </table>
              
       <br><br><br>
        Please click this button and log into your Customer Portal to review your signed RetailInstallment Contract &Electronic Funds Transfer Authorization in the "Document Center" of your Customer Portal.
       <br><br><br>

        <a class="button" style="text-align:center" href="${
          process.env.UI_URL
        }borrower/login">click here</a>
   </div>`;
      emailFooter = '';
    }

    let toEmail = rawdata[0].email;

    await this.client.send({
      to: toEmail,
      from: process.env.FromMail,
      subject: `Modern Health Finance Invite Link`,

      html: `
      <html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width" />
  <style>
      .wrapper {
          border: 5px solid #eee;
          border-radius: 5px;
      }
      .emailHeader {
          width: auto;
          background-color: #002f6c;
          color: #FFF;
          height: 90px;
          max-height: 90px;
          text-align: center;
          padding: 10px;
          border-bottom: 4px solid #eb0029;
          font-size: 150%;
      }
      .practiceHeaderName {
          text-align: center;
          color: #FFF;
          font-size: 190%;
      }
      .button {
        background-color: #008CBA;
        border: none;
        color: white !important;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
      }
      .emailLogo {
          height: 40px;
          max-height: 40px;
          width: auto;
          margin-top: 5px;
          margin-bottom: 5px;
          color: rgb(47,97,183);
          font-size: 30px;
          font-weight: 700;
      }
      .emailLayout {
          margin: 0 auto;
          max-width: 600px;
          min-width: 320px;
          width: auto;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
      }
      .emailLayoutMargins {
          margin-bottom: 50px;
      }
      .emailSignature {
          margin-top: 30px;
          text-align: center;
          color: #60666d;
          font-size: 16px;
      }
      .emailBodyOuterDiv {
          color: #60666d;
          font-size: 16px;
          text-align: center;
      }
      .emailGreetings {
          margin-bottom: 30px;
          font-style: normal;
          font-weight: normal;
          color: #60666d;
          font-size: 20px;
          text-align: center;
      }
      .btn-application {
          font-size: 14px;
          webkit-font-smoothing: antialiased;
          cursor: pointer;
          -moz-user-select: none;
          -webkit-user-select: none;
          -o-user-select: none;
          user-select: none;
          display: inline-block;
          font-weight: normal;
          text-align: center;
          text-decoration: none;
          -moz-transition: all .4s ease;
          -webkit-transition: all .4s ease;
          -o-transition: all .4s ease;

          background-color: #002f6c;

          border-radius: 6px;
          border-width: 0px;
          color: rgb(255,255,255);
          font-family: sans-serif;
          height: auto;
          transition: all .4s ease;
          padding: 8px 20px;
          text-shadow: none;
          width: auto;
          line-height: 1.5em;
      }
      .emailBold {
          font-weight: 700;
      }

  table, th, td {
    border: 1px solid black;
  }
  td {
    padding: 5px;
  }
  table {
    margin: auto;
    width: 70%;
    border-collapse: collapse;
  }
  p {
    text-align: left;
    color: #60666d;
  }
  </style>
  <style>
      @media (max-width: 721px) {
          .emailHeader {
              max-height: 700px;
          }
          .modernHealthName {
              font-size: 50%;
          }
          .practiceHeaderName {
              font-size: 80%;
          }
      }
  </style>
</head>

<div class="wrapper">
  <div class="emailHeader">
      <div class="emailHeaderLogo">
          <span class="modernHealthName">${this.companyName}</span>
          <br><br>
          <span class="modernHealthName">${data1[0].practiceName}</span>
 
      </div>
      
  </div>
  <div class="emailLayout">
      <div class="emailLayoutMargins">
          <div class="emailBodyOuterDiv">
      <h2 class="emailGreetings">Hi ${rawdata[0].firstname}, </h2>
  </div>  
            ${body}
            ${emailFooter}
          <div class="emailSignature">
              Thank you,<br /><br>
            
          </div>
      </div>
  </div>
</div>
</html> `,
    });
  }
  async send_offers_mail(Email, url) {
    try {
      await this.client.send({
        to: Email,
        from: process.env.FromMail,
        subject: 'Modern Health Finance Loan Application',
        attachments: this.data,
        html:
          this.html1 +
          `    
          <tr>
            <td colspan="7" height="70px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif;">
            Congratulations!
            </td>
          </tr>
         <tr>
           <td>
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             Your Modern Health Finance Funding account is ready to move forward!
             </p> 
             <p style="list-style: none;line-height: 30px;font-size: 17px;color:#858399;margin:0px 0px 15px;font-family: Arial, sans-serif;">
             <a href="${url}">Click</a> to continue the loan application.
             </p>              
          </td>
         </tr>
          ` +
          this.html2,
      });
      console.log('Offers mail sent successfully');
    } catch (error) {
      console.error('Error sending Offers email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}
