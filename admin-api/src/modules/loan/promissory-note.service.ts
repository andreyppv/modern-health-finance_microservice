import { getManager } from 'typeorm';

export class promissoryNote {
  data: any = {};

  async getHtmlData(loan_id) {
    const entityManager = getManager();

                  // let userDetails = await entityManager.query(`
                  // select cus.loanterm , pra."zipcode" as prazip, pra.city as pracity,pra."streetaddress" as prastreetaddress,
                  //     pra."statecode" as prastatecode,pra."phonenumber" as praphonenumber,*,
                  //     off.downpayment from customer cus
                  //     left join practice pra on pra.id = cus."practiceid"
                  //     left join user user1 on user1.id = cus.user_id
                  //     left join loanoffers off on off.loan_id = cus.loan_id
                  //     where cus.loan_id = '${loan_id}'
                  // `);

                  let userDetails = await entityManager.query(`
                  select  pra."zipcode" as prazip, pra.city as pracity,pra."streetaddress" as prastreetaddress,
                      pra."statecode" as prastatecode,pra."phoneno" as praphonenumber, *
                       from practicemanagement pra
                           
                  `);

    console.log(userDetails);

                    userDetails = userDetails[0];
                    let userName = userDetails.firstname + ' ' + userDetails.lastname;
                    let practicePhoneNo = userDetails.praphonenumber;
                    let practiceName = userDetails.practicename;
                    let userAddress = `${userDetails.streetaddress} ${userDetails.city} ${userDetails.state} ${userDetails.zipcode}`;
                    let practiceAddress = `${userDetails.prastreetaddress}, ${userDetails.pracity}, ${userDetails.prastatecode}, ${userDetails.prazip}`;
                    let downpayment = userDetails.downpayment;
                    let loanTerm = userDetails.loanterm;

    // let paymentDetails = await entityManager.query(
    //   `select apr,  "loanamount",  "createdat" from paymentmanagement where loan_id ='${loan_id}'`,
    // );

    let paymentDetails = await entityManager.query(
      `select apr,  "amount",  "createdat" from paymentschedulehistory `,
    );
    //console.log(paymentDetails); 
                  // let apr = userDetails.apr;
                  // let loanamount = userDetails.loanamount;
                  paymentDetails = paymentDetails[0];
                  let apr = paymentDetails.apr;
                  let loanamount = paymentDetails.amount
                  let totalSalesPrice = parseFloat(downpayment) + parseFloat(loanamount);

                  let totalCashPrice = 6000;
                  let Amountfinanced = totalCashPrice - parseFloat(downpayment);

    let d = new Date();
    // let signDate =
    //   d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
    var dd: any = d.getDate();
    var mm: any = d.getMonth() + 1;
    let yyyy = d.getFullYear();
    mm < 10 ? (mm = '0' + mm) : (mm = '' + mm);
    dd < 10 ? (dd = '0' + dd) : (dd = '' + dd);
    let signDate = dd + '-' + mm + '-' + yyyy;
    console.log(signDate);
                   let date = userDetails.createdat.toISOString().split('T')[0];

              // let interest = await entityManager.query(
              //   `select sum(interest),min("scheduledate"), avg(amount) from paymentschedule where loan_id ='${loan_id}' and delete_flag='N'`,
              // );

    let interest = await entityManager.query(
                `select sum(interestapplied),min("maturitydate"), avg(amount) from paymentschedulehistory `,
              );
    console.log(interest);

    let financeCharge = interest[0].sum;
    financeCharge = financeCharge.toFixed(2);

    let paymentdate = interest[0].min.toISOString().split('T')[0];
    let dueAmount = interest[0].avg.toFixed(2);

                let totalPayment = parseFloat(loanamount) + parseFloat(financeCharge);
                console.log(
                  'finData',
                  financeCharge,
                  totalPayment,
                  loanamount,
                  apr,
                  date,
                  paymentdate,
                  dueAmount,
                );
    let primaryOwnerSignatureTag = `<img id="sign" style="width:300px" src = "{({Signature0})}">`;

              //  this.data['userDetails'] = userDetails;
    // this.data['paymentDetails'] = paymentDetails;
    this.data['interest'] = interest;
    let html = `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
        <style>
            table tr td {
                padding:5px;
                font-size:12px
            }
            ol li{ padding-bottom:10px}
            ul li{ padding-bottom:10px}
    </style>
        </head>
        
        <body style="margin: 0;padding: 10px;">
            <div class="page" style="  margin-left: auto; margin-right:auto; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; padding:20px; ">
  <h3 style="color: #606060; text-align: center;">${practiceName}</h3>
  <p style="font-size:16px; text-align:center; color: #606060;">${practiceAddress}</p>
  <!-- Cover Letter -->
  <div  >
    <p > Thank you for choosing ${practiceName}. Congratulations on taking this life changing step. </p>
    <p > This is the Installment Sales Agreement for your upcoming procedure with ${practiceName}.
      Please read the contract and the information below as there are important deadlines that must be met.
      Delays could cause ${practiceName} to not be able to offer financing. </p>
    <h4 style="margin-bottom: 10px;">The Retail Installment Sales Contract</h4>
    <p > ${practiceName} requires that this contract should be signed right away,
      The contract will be dated to start on the day of your procedure, when scheduled.
      Typically, your first payment will be due 30-days after your procedure.
      Since most people need time to recover, you may miss some time at work.
      Please make sure you have reserved enough money for your first payment. </p>
    <p > There are attachments to the contract allowing us to contact you electronically and collect your
      payment directly from your bank, as well as an arbitration agreement in the event of a dispute. </p>
    <p > All payments are collected through ACH (electronic check) or debit card. There is a page for you to
      provide your banking information. Payments are automatically deducted on the day you chose when
      you submitted your application. Tell us now if you need to change the payment date shown in the
      contract on the next page. </p>
    <p > Your ACH or e-check payment will read "<span class="emphasize">Private Payment Services</span>" or
      "<span class="emphasize">PrivatePmtSvcing</span>" depending on your bank. </p>
    <p > Please Note: “Once your contract is effective, email notices regarding your new account &amp; payment 
      reminders will come from portal1@FA-servicing.com. Please note this email address as it may go 
      directly into your junk or spam folders. Account access will also become available online at 
      https://myaccount.1stassociates.com/Register.aspx”. </p>
    <h4 style="margin-bottom: 10px;">Down Payment</h4>
    <p > We assume that any Down Payment due to your provider, you are paying directly to ${practiceName}
      unless arrangements are otherwise made. Please ensure these arrangements are fully understood or
      contact your provider for more information. </p>
    <h4 style="margin-bottom: 10px;">Contact Us</h4>
    <p > Our telephone number for questions is ${practicePhoneNo} option 1.
      Hours of operation are 8:30am-6:00pm PST, Monday through Friday. </p>
  </div>
  <!-- Promissory Note Loader -->
  <div class="row" id="loaderidpromissorynote" style="display:none;">
    <div class="" align="center" style="text-align:center;position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,0.7);">
      <div style="height:100%;width:100%;background:url('/images/img/ajaxloader.gif') no-repeat center;margin-top:-233px;"></div>
    </div>
  </div>
  <br>
  <hr class="richr">
  <br>
  <!-- RIC --><div style="break-after:page"></div>
  <div class="promtitles">
    <h3 class="bold" style="color: #606060; text-align: center;">${practiceName}</h3>
    <p class="bold" style="font-size:16px; text-align:center; color: #606060;">4362 Blue Diamond Rd #102-348&nbsp;Las Vegas,&nbsp;NV&nbsp;89139</p>
    <br>
    <center>
      <h3 class="bold">RETAIL INSTALLMENT SALE CONTRACT</h3>
    </center>
  </div>
  <!--Customer and Provider Info Table-->
  <table width="100%"  border="1" style="border-collapse:collapse" bordercolor="#569946">
    <tbody>
      <tr>
        <td width="50%" class="bold" valign="top">Buyer's Name and Address<br>
          <br>
          ${userName}<br>
         ${userAddress}</td>
        <td width="50%" valign="top" class="bold">Date of Contract<br>
          <br>
          ${date}</td>
      </tr>
      <tr>
        <td width="50%" valign="top" class="bold">Co-Buyer's Name and Address</td>
        <td width="50%" valign="top" class="bold">Contract No<br>
          <br>
          APL_11311</td>
      </tr>
      <tr>
        <td width="50%" class="bold"  valign="top">Seller's Name<br>
          <br>
          ${practiceName}</td>
        <td width="50%" valign="top" class="bold">Seller's Contract Information<span class="phoneMask"><br>
          <br>
          619-874-9663</span>, contact@pompeiisurgical.com</td>
      </tr>
    </tbody>
  </table>
  <br>
  <!-- Text Before Lending Block -->
  <div >
    <p > In this Contract the words "we," "us," and "our" refer to Seller. The words "you" and "your" refer to Buyer (and Co-Buyer, if any) named above. By signing this Contract, you are buying the "Services" described below from the Seller named above, and you agree to the terms set forth on the front and back of this Contract. </p>
    <p>Services:&nbsp;&nbsp;Elective Surgery</p>
    <p > The price of the Services is shown below as the "Cash Price." By signing this Contract, you choose to buy the Services on credit and agree to pay us the total principal amount shown below as the "Amount Financed," which will be (1) the total cash price of the Services; plus (2) any costs, fees, or other amounts financed; plus (3) interest at the rate of : &nbsp;24.9%&nbsp; on the unpaid balance until it is fully repaid. The interest will be calculated on a simple-interest basis based upon a year of 365 days and the actual number of days elapsed. You agree to pay us in the amounts and under the terms set forth in this Contract. If this Contract is signed by a Buyer and Co-Buyer, each is individually and jointly responsible for all agreements in this Contract. </p>
  </div>
  <br>
  <!-- Federal Truth In Lending Disclosure -->
  <table  border="1" style="border-collapse:collapse" bordercolor="#569946">
    <tbody>
      <tr>
        <td colspan="5"><div class="bold" style="text-align: center;padding:5px; font-size: larger;"><strong> Federal Truth in Lending Act Disclosures</strong></div></td>
      </tr>
      <tr>
        <td valign="top"  style="text-align: left;"><div style="height:80px"><strong>Annual Percentage Rate</strong><br>
            The Cost of your credit as an annual rate.</div><br>
          <div>${apr} %</div>       </td>
        <td valign="top"  style=" text-align: left;"><div style="height:80px">Finance Charge</strong><br>
          The dollar Amount the credit will cost you.</div>
          <div> $${financeCharge}	</div></td>
        <td valign="top"  style="text-align: left;"><div style="height:80px"><strong>Amount Financed</strong><br>
          The amount of credit provided to you or on your behalf.</div>
          <div>$${loanamount}	</div></td>
        <td valign="top"  style=" text-align: left;"><div style="height:80px"><strong>Total of Payments</strong><br>
          The amount you will have paid after you made all payments as scheduled.</div>
          <div>$ ${totalPayment}</div></td>
        <td valign="top"  style=" text-align: left;"><div style="height:80px"><strong>Total Sale Price</strong><br>
          The total cost of your purchase on credit, including your down payment of $<span class="uline">${downpayment}</span></div>
        <div>$ ${totalSalesPrice}</div></td>
      </tr>
      
      <tr>
        <td colspan="5"><!--Payment Schedule-->
          <div class="texock"> <strong>Payment Schedule:</strong><br>
            ${loanTerm} monthly payments of ${dueAmount} beginning on ${paymentdate} <br>
            <div><span ><strong>Late Charges</strong>:</span> If any payment is more than 10 days late, you will be charged a late charge of $15.00.</div>
            <div><span ><strong>Prepayment</strong>:</span> If you pay early, you will not have to pay a penalty.</div>
            <div><span ><strong>Non-refundable Application Fee</strong>:</span> $0.00 must be paid at time of application.</div>
            <div>Read the Contract for any additional information about nonpayment, default, any required prepayment in full before the scheduled date. </div>
          </div></td>
      </tr>
    </tbody>
  </table>
  <!-- Text Below Payment Schedule -->
 <br>

  <br>
  <div style="break-after:page"></div>
  <!-- Left Side Amount Financed Box -->
  <table  border="1" style="border-collapse:collapse" bordercolor="#569946" width="100%">
    <tbody>
      <tr>
        <td colspan="4"><p style="text-align: center;"> <strong> Itemization of Amount Financed </strong> </p></td>
      </tr>
      <tr>
        <td style="vertical-align: text-top; width: 5%">1.</td>
        <td valign="top" style="width: 46%"><table width="100%" border="0" style="border-collapse:collapse" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td width="52%">CASH PRICE AND TAXES</td>
                <td width="12%"></td>
                <td width="36%"></td>
              </tr>
              <tr>
                <td style="width: 14%; white-space:nowrap" >A. Cash price of the Service</td>
                <td style="text-align: right; width: 2%">$</td>
                <td style="text-align: right; border-bottom: solid 1px; width: 33%;">${totalCashPrice}</td>
              </tr>
              <tr>
                <td>B. Taxes on Sale</td>
                <td style="text-align: right;">$</td>
                <td style="text-align: right; border-bottom: solid 1px;;">0.00</td>
              </tr>
              <tr>
                <td style="white-space:nowrap" >TOTAL CASH PRICE AND TAXES</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table></td>
        <td align="right" valign="bottom" >
       <div style="width:120px"> <div style="float:left"> $ </div> <div style="width:100px; border-bottom:1px solid #000">${totalCashPrice}</div>    </div>     </td>
        <td style="vertical-align: bottom; width: 7%">(1)</td>
      </tr>
      <tr>
        <td>2.</td>
        <td>
        
        
        
        
        <table width="100%" border="0" style="border-collapse:collapse" cellpadding="0" cellspacing="0" >
            <tbody>
              
              
              <tr>
                <td width="51%">Amount Paid to Others:</td>
                <td width="11%" style="text-align: right;">$</td>
                <td width="38%" style="text-align: right; border-bottom: solid 1px;">0.00</td>
              </tr>
            </tbody>
          </table>    </td>
        <td align="right" valign="bottom"> <div style="width:120px"> <div style="float:left"> $ </div> <div style="width:100px; border-bottom:1px solid #000">0.00	</div>    </div> </td>
        <td>(2)</td>
      </tr>
      <tr>
        <td>3.</td>
        <td>Total (1 + 2)</td>
          <td align="right" valign="bottom"> <div style="width:120px"> <div style="float:left"> $ </div> <div style="width:100px; border-bottom:1px solid #000">${totalCashPrice}		</div>    </div> </td>
        <td>(3)</td>
      </tr>
      <tr>
        <td>4.</td>
        <td>Down Payment</td>
       <td align="right" valign="bottom"> <div style="width:120px"> <div style="float:left"> $ </div> <div style="width:100px; border-bottom:1px solid #000">$ ${downpayment}	</div>    </div> </td>
        <td>(4)</td>
      </tr>
      <tr>
        <td>5.</td>
        <td>Total&nbsp;Amount&nbsp;Financed<br>
          (4&nbsp;less&nbsp;5)</td>
        <td align="right" valign="bottom"> <div style="width:120px"> <div style="float:left"> $ </div> <div style="width:100px; border-bottom:1px solid #000">${Amountfinanced}				</div>    </div> </td>
        <td  valign="bottom">(5)</td>
      </tr>
    </tbody>
  </table>
  <!-- Signature for RIC -->
  <div> <br>
    <p >NOTICES: The names and addresses of all persons to whom the notices required or permitted by law to be sent are set forth above.</p>
    <p > <strong> BUYER AND ANY CO-BUYER ACKNOWLEDGE THAT PRIOR TO SIGNING THIS CONTRACT EACH HAS READ AND RECEIVED A LEGIBLE, COMPLETELY FILLED-IN COPY OF THIS CONTRACT
      AND THAT, UPON SIGNING, SUCH COPY WAS ALSO SIGNED BY THE PARTIES HERETO. </strong> </p>
    <p > Buyer aid any Co-Buyer acknowledge that (1) before signing this Contract each read this Contract and received a legible,
      completely filled-in copy of this Contract, and (2) each has received a copy of every other document that each signed during the
      Contract negotiations. </p>
    <a id="sigpad1" name="sigpad-1"></a>
    <table width="100%" id="highCostSignature">
      <tbody>
        <tr>
          <td><!-- Signature Lines -->
            <table width="100%">
              <tbody>
                <tr>
                  <td width="16%" style="text-align:right;"><strong>Buyer:</strong></td>
                  <td width="40%" style="border-bottom:1px solid black;padding:0 18px;"><span id="stamp-hc"> 
                    ${primaryOwnerSignatureTag}
                  </span> </td>
                  <td width="1%">&nbsp;</td>
                  <td width="6%" style="text-align:right;">Date:</td>
                  <td id="stamp-hc-date" width="14%" style="border-bottom: 1px solid black;"> ${date} </td>
                  <td></td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                </tr>
                <tr>
                  <td width="16%" style="text-align:right;"><strong>Co-Buyer:</strong></td>
                  <td width="40%" style="border-bottom:1px solid black;padding:0 18px;">&nbsp;</td>
                  <td width="1%">&nbsp;</td>
                  <td width="6%" style="text-align:right;">Date:</td>
                  <td width="14%" style="border-bottom: 1px solid black;">&nbsp;</td>
                  <td></td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                </tr>
                <tr>
                  <td width="16%" style="text-align:right;"><strong>Seller:</strong></td>
                  <td width="40%" style="border-bottom:1px solid black;padding-bottom:0;  padding-right: 25px;">${practiceName}</td>
                  <td width="1%">&nbsp;</td>
                  <td width="6%" style="text-align:right;">Date:</td>
                  <td width="14%" style="border-bottom: 1px solid black;">${date}</td>
                  <td></td>
                </tr>
                <tr>
                  <td width="16%" style="text-align:right;"></td>
                  <td width="40%" style=""><strong>Name &amp; Title</strong></td>
                  <td width="1%">&nbsp;</td>
                  <td width="6%" style="text-align:right;">&nbsp;</td>
                  <td width="14%">&nbsp;</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <br>
            <div id="signInstructionsRIC" style="display: none;">Please click and hold your mouse to sign your signature in the box below.</div>
            <div id="signerrorRIC" style="display:none;">
              <center>
                <p style="color: red;"><strong>Please read and sign.</strong></p>
              </center>
            </div>
            <br>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!--Starting of Fine Print on the Second Page -->
  <div>
    <center>
      <h3 class="bold">ADDITIONAL TERMS AND CONDITIONS</h3>
    </center>
    <ol style="list-style:decimal" >
    <li>Application of Payments: You agree that payments will be applied first to interest accrued but unpaid as of the date of processing of the payment, next to late charges or other charges, and finally to principal.</li>
    <li>Default and Acceleration: You will be in default if you fail to make payment or keep other promises you make in this Contract. If you default in making any payment when due, or in the performance of any term or condition of this Contract, we may, in addition to our other remedies, declare all unpaid sums immediately due and payable. You waive your right to require us to do certain things. Those things are (a) to demand payment of amounts do; (b) to give notice that amounts due have not been paid; (c) to obtain an official certification of finanace payments. Anyone else who agrees to keep the promises made in this Contract or who agrees to make payments to us if you fail to keep your promises under this Contract (these persons are known as "Co-Signors" or "Guarantors") also waives these rights. As required by law, you are hereby notified that a negative credit report reflecting on your credit record may be submitted to a credit reporting agency if you fail to fulfill the terms of your credit obligations. If we take any adverse action and the adverse action is based, in whole or in part, on any information contained in a consumer credit report, you have the right to obtain within 60 days a free copy of your consumer credit report form the consumer reporting agency who furnished us your consumer credit report and from any other consumer reporting agency which compiles and maintains files on consumers on a nationwide basis. You may have the right to dispute the accuracy or completeness of any information in a consumer credit report furnished by the consumer credit reporting agency.</li>
    
    <li>Co-Buyers, Co-signers and Guarantors: If more than one person signs this Contract, each of you agrees to be fully and personally obligated to pay the full amount owed and to keep all the promises made in this Contract. Any guarantor of this Contract (as described in paragraph 3, above), is also obligated to do these things. You agree that we may enforce our rights under this Contract against each of you individually or against all of you together. This means that any one of you may be required to pay all of the amounts owed under this Contract.</li>
    <li>Prepayment and Acceleration: You may prepay all amounts due under this Contract at any time without penalty.</li>
    <li> Promotional Financing Option. You will be billed for monthly payments beginning one month after your date of purchase. Your billing will include interest the rate of [IntRate] to your account from the date of the purchase contract. However, if your purchase contract is paid in full within the 180 day promotional period, then all the interest you have paid will be rebated to you. The Minimum Monthly Payment may or may not pay off the promotional purchase before the end of the promotional period. Interest will be credited to your account if you meet the following conditions:   <ol style="list-style:lower-alpha">
    <li>Make all minimum monthly payments on time.</li>
    <li>Do not incur a late fee or NSF fee.
</li>
    <li>Notify us via telephone at 949-207-9323 extension 1 or via email<br>

Contact@ModernHealthFinance.com before you make your final payment to confirm.</li>
    
    
    </ol>
    </li>
    
    <li>Credit Information: You warrant that all information contained in your application for credit is true and correct, and acknowledge that we have relied upon the accuracy thereof in connection with this Contract.</li>
    <li>Non Refundable Application Fee: A fee of $0.00 is charged and collected at time of application. "This fee pays for underwriting and third party credit report services.</li>
    <li>Late Charges; Returned Check Charges: If you default in the payment of any installment for a period of 10 days or more, we will collect a late charge in the amount of $15.00. You also recognize that you will pay more interest if you do not make a payment by the date it is due. If you make any payment to us or to our agent with a check that is returned unpaid, we will collect a $25.00 returned check charge.</li>
    
    <li> Governing Law: This Contract will be governed by the laws of the State of CA.</li>
    <li> If this Agreement is subject to a law which sets maximum interest rates and/or charges, and that law is finally interpreted so that the interest or other charges collected or to be collected in connection with this Agreement exceed such permitted limits, then: (a) we will reduce any such interest rate by the amount necessary to reduce the charge to the permitted limit; and (b) any sums already collected from you which exceeded permitted limits will be refunded to you. We may choose to make this refund by reducing the outstanding balance owed under the Agreement or by making a direct payment to you. Your acceptance of any such refund made by direct payment to you, whether by direct payment to you or by credit to your outstanding balance, will constitute a waiver of any right of action you may have arising out of such overcharge.</li>
    
    <li> Automatic Payments: You agree that if you have agreed to automatic installment payments, and you discontinue that agreement or fail to make an automatic installment payment, the interest rate you will pay under this Contract will increase to 35.90% per annum. In that event, we will notify you of your new payment schedule.</li>
    <li> Rights Upon Default: If (a) you default in the performance of any of the terms and conditions of this Contract, including but not limited to the making of any payment when due; (b) you become insolvent or are the subject of bankruptcy proceedings; or (c) you die, we at our option and without notice may (i) declare all unpaid sums due under this Contract immediately due and payable; or (ii) file suit against you for all unpaid sums due under this Contract. In the event that you fail to notify us of any change of address or fail to communicate with us for a period of 45 days after any default in paying any installment due under this Contract, we may collect reasonable costs of collection. In the event that any action to enforce the terms or conditions of this Contract is brought, the prevailing party shall be entitled to reasonable attorneys' fees and court costs.</li>
    <li>Other Agreements: You agree that if we accept monies in sums less than those due or make extensions of due dates or payments under this Contract, doing so will not be a waiver of any later right to enforce the contract terms as written. You agree to send any communication about a disputed debt, including any check or other payment instrument marked "paid in full" or with similar words, to the following address: ${practiceName} 4362 Blue Diamond Rd #102-348 Las Vegas, NV 89139. We intend to transfer this Contract to an assignee, you will be given full notice thereof and you agree that the assignee will have all our rights and remedies under this Contract and you agree to pay all that is still owed under this Contract at all times, and in the amount, to the assignee. You agree that all of the agreements between you and us are set forth in this Contract and that no modification of this Contract shall be valid unless it is made in writing and signed by you and us. You agree that if any provision of this Contract is held invalid, that shall not affect the validity of any other provision of this Contract, and that the remaining provisions of the Contract continue to be binding and enforceable.</li>
    
    
    
    </ol>
    
    <center>
      <h3 class="bold">NOTICE</h3>
    </center>
    <p ><strong> ANY HOLDER OF THIS CONSUMER CREDIT CONTRACT IS SUBJECT TO ALL CLAIMS AND
      DEFENSES WHICH THE DEBTOR COULD ASSERT AGAINST THE SELLER OF GOODS OR
      SERVICES OBTAINED PURSUANT HERETO OR WITH THE PROCEEDS HEREOR.
      RECOVERY HEREUNDER BY THE DEBTOR SHALL NOT EXCEED AMOUNTS PAID BY THE
      DEBTOR HEREUNDER. </strong></p>
    <p > Notice to Buyer: (1) Do not sign this Contract before you read it or if it contains any blank spaces to be filled
      in. (2) You are entitled to a completely filled-in copy of this Contract. (3) You can prepay the full amount
      due under this Contract at any time. (4) If you desire to pay off in advance the full amount due, that amount
      will be furnished upon request. </p>
  </div>
  <br>
  <hr class="richr">
  <br>
  <!-- EFTA -->
  <div>
    
    <br>
    <br>
    <div id="bankaccountid" style="display: none;"></div>
    <p style="margin:0px; text-align: center; font-size: 160%;"> ${practiceName} </p>
    <p style="margin:0px; text-align: center; font-size: 130%;"> 4362 Blue Diamond Rd #102-348 </p>
    <p style="margin:0px; text-align: center; font-size: 130%;"> Las Vegas,&nbsp;NV&nbsp;89139 </p>
    <p style="margin:0px; text-align: center; font-size: 130%;"> <span class="phoneMask">619-874-9663</span> - contact@pompeiisurgical.com </p>
    <br>
    <h2 style="margin:0px; text-align: center;"> OPTIONAL VOLUNTARY ELECTRONIC PAYMENT AUTHORIZATION </h2>
    <br>
    <h3 style="margin:0px; text-align: left;"> NOTICE: THIS ELECTRONIC PAYMENT AUTHORIZATION IS OPTIONAL - I UNDERSTAND THAT I WILL STILL BE ABLE TO ENTER INTO MY Truth-In-Lending Disclosure and Note or  Retail Installment Agreement IF I DO NOT SIGN THIS AUTHORIZATION</h3>
    <br>
    <h3 style="margin:0px; text-align: justify;"> I hereby exercise my (our) option to make the payments agreed to in my Truth in Lending Disclosure and Note or Retail Installment Agreement  by electronic payment and do voluntarily authorize Modern Asset Management, Inc. dba Modern Health Finance, as servicer for ${practiceName}, Inc its successors or assigns ("Servicer") to do the following: </h3>
    <br>
    <ol>
      <li style="margin:0px; text-align: justify;">Initiate automatic electronic payments from My Bank Account specified below and debit My Bank Account on the Payment Dates specified in my Agreement, or for any lesser amount I (we) owe.</li>
      <li style="margin:0px; text-align: justify;">Re-initiate a payment debit up to two additional times for the same amount if the payment is not made for any reason.</li>
      <li style="margin:0px; text-align: justify;">If necessary, to credit my account to correct erroneous debits.</li>
      <li style="margin:0px; text-align: justify;">Initiate a separate electronic payment from My Bank Account below for any applicable late payment charge or returned check fee in the amounts set forth in my Agreement.</li>
      <li style="margin:0px; text-align: justify;">I may make any payment at any time by check delivered by mail or courier service to 23030 Lake Forest Dr. Suite #202, Laguna Hills, CA 92653 , that such payment is to replace my next previously authorized Electronic Payment, I acknowledge that Servicer must receive it at least three (3) business days beore the previously authorized Electronic Payment is scheduled to be made and I will notify Servicer in writing, at 23030 Lake Forest Dr. Suite #202, Laguna Hills, CA 92653 , that such payment is to replace my next previously authorized Electronic Payment. If I want such payment to be a payment in addition to the scheduled Authorized Electronic Payment, I will notify Servicer accordingly. This Electronic Payment Authorization will remain in effect unless I explicitly notify Servicer that my Electronic Payment Authorization is withdrawn. </li>
    </ol>
    <br>
    <h3 style="margin:0px; text-align: center;"> PURPOSE OF AUTHORIZATION </h3>
    <p style="margin:0px; text-align: justify; padding-bottom:10px"> I agree that the electronic payment authorized herein is voluntary and for my convenience. This Electronic Payment Authorization is a payment mechanism only and does not give Seller or Servicer any collection rights greater than those otherwise contained in my Agreement. This Authorization does not constitute and is not intended to constitute a security interest under state law. </p>
    <h3 style="margin:0px; text-align: center;"> HOW TO WITHDRAW YOUR AUTHORIZATION </h3>
    <p style="margin:0px; text-align: justify;"> I understand that this Electronic Payment Authorization is to remain in full force and effect until Servicer has received written notification from me that I wish to revoke this authorization. I understand that Servicer requires at least three (3) business days prior notice, at 23030 Lake Forest Dr. Suite #202, Laguna Hills, CA 92653 , in order to cancel this Authorization.</p>
    <br>
     
     <table width="100%"  cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse" bordercolor="#569946" >
  <tr>
    <td colspan="2" align="center"><strong>My Designated Bank Account</strong> </td>
    </tr>
  <tr>
    <td width="30%">Name of bank:</td>
    <td>Chase${1}</td>
  </tr>
  <tr>
    <td>Account Type:</td>
    <td>checking${2}</td>
  </tr>
  <tr>
    <td>Routing Number:</td>
    <td>011401533${3}</td>
  </tr>
  <tr>
    <td>Account Number:</td>
    <td>1111222233330000</td>
  </tr>
    <tr>
    <td>Or Debit Card Number:
</td>
    <td>&nbsp;</td>
  </tr>
  
  <tr>
    <td colspan="2" align="center"> <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td>Expiration Date: </td><td>  </td>
    <td>Security Code:</td>
    <td>  </td>
    <td>Security Code:</td><td> </td>
  </tr>
</table>
 </td>
    </tr>
</table>

     
 
 
    <br>
    <p > <strong>BY SIGNING BELOW, BORROWER AGREES TO THE TERMS AND CONDITIONS OF THIS ELECTRONIC FUNDS TRANSFER AGREEMENT</strong> </p>
    <div> <a id="sigpad3" name="sigpad-3"></a> <br>
      <p> </p>
      <table class="table-responsive">
        <tbody>
          <tr>
            <td width="40%" style="border-bottom:1px solid black;padding:0 18px;"><span id="stamp-eft">
              ${primaryOwnerSignatureTag}
            </span> </td>
            <td width="6%">&nbsp;</td>
            <td id="stamp-eft-date" width="14%" style="border-bottom: 1px solid black; margin-left: 60px;">${signDate}</td>
            <td id="40%"></td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: bold;">Borrower's Signature</td>
            <td style="padding-left: 20px; padding-right: 20px;">&nbsp;</td>
            <td style="text-align: center; font-weight: bold;">Date</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p></p>
      <br>
      <div  style="display:none;">
        <center>
          <p style="color: red;"><strong>Please sign Electronic Funds Agreement.</strong></p>
        </center>
      </div>
 
 
       
      <br>
    </div>
    <br>
 
  </div>
 
  <hr class="richr">
  <!-- Arbitration Agreement -->
  <br><div style="break-after:page"></div>
  <center>
    <h3 class="bold">Arbitration Agreement </h3>
  </center>
  <br>
  <div>
  
  <table width="100%" border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse" bordercolor="#569946">
  <tr>
    <td align="center"><strong>NOTICE OF ARBITRATION AGREEMENT</strong></td>
  </tr>
  <tr>
    <td>        <p > This Arbitration Agreement provides that all disputes between you and&nbsp;${practiceName}&nbsp;
          will be resolved by <strong>BINDING ARBITRATION.</strong> You thus <strong>GIVE UP YOUR RIGHT TO GO TO COURT</strong> to assert or defend your rights under this contract
          (<strong>except</strong> for matters that may be taken to <strong>Small Claims Court</strong> and <strong>except</strong> for matters seeking public injunctive relief). </p>
          
          <ul>
          <li>Your rights will be determined by a <strong>NEUTRAL ARBITRATOR</strong> and <strong>NOT</strong> a judge or jury. </li>
          <li>You are entitled to a <strong>FAIR HEARING, BUT</strong> the arbitration procedures are <strong>SIMPLER AND MORE LIMITED THAN RULES APPLICABLE IN COURT.</strong></li>
          <li>Arbitrator decisions are as enforceable as any court order and are subject to <strong>VERY LIMITED REVIEW BY A COURT.</strong></li>
          </ul>
          
          <strong>FOR MORE DETAILS, PLEASE READ THIS ARBITRATION AGREEMENT CAREFULLY.</strong>
          
          </td>
  </tr>
</table>

     
    <br>
    <p > Throughout this Arbitration Agreement,&nbsp;${practiceName}&nbsp;, Modern Asset Management, Inc.,
      dba Modern Health Finance, and any future assigns, is referred to as "we" and "us,"
      and all of Lender's customers who sign this Arbitration Agreement are referred to as "you." </p>
      <ol>
      <li>
       <strong> Dispute Resolution by Arbitration:</strong> Any and all claims, controversies, or disputes arising out of or related
      in any way to your Retail Installment Sales Agreement Truth-in-Lending Disclosure, (the "Service Agreement") entered into by you
      and us on the same date as this Arbitration
      Agreement shall be subject to binding arbitration pursuant to the under the Federal Arbitration Act. This
      Arbitration Agreement is made pursuant to a transaction involving interstate commerce, and shall be
      govemed by the Federal Arbitration Act (the "FAA"), 9 U.S.C. Sections 1-6. This Agreement
      applies to, without limitation, (1) all issues concerning the transaction in connection with which this
      Arbitration Agreement has been executed; (2) initial claims, counterclaims, cross-claims, and third-party
      claims, whether arising in law or equity, and whether based upon federal, state, or local law; contract; tort;
      fraud or other intentional tort; constitution, common law, or statute; (3) any issue as to whether any such
      claims, controversies, or disputes are subject to arbitration; and (4) any claims, controversies, or disputes that
      would otherwise be subject to class actions. This means that all claims, controversies or disputes that are the
      subject of class actions will also be subject to binding arbitration under the FAA and this Arbitration
      Agreement. THE ARBITRATOR SHALL NOT CONDUCT CLASS ARBITRATION; THAT IS, THE
      ARBITRATOR SHALL NOT ALLOW YOU OR US TO SERVE AS A PRIVATE ATTORNEY
      GENERAL, AS A REPRESENTATIVE, OR IN ANY OTHER REPRESENTATIVE CAPACITY FOR
      OTHERS IN THE ARBITRATION. 
      
      </li>
      
      <li>
      
       <strong>  Consent to Arbitration</strong>: You and we understand and agree that you and we are choosing arbitration rather
      than litigation to resolve disputes. You and we understand that you and we have the right to litigate disputes
      but that you and we prefer to do so through arbitration. In arbitration, you may choose to have a hearing and
      be represented by counsel. <strong>THEREFORE, YOU UNDERSTAND THAT BY ENTERING INTO THIS
      ARBITRATION AGREEMENT, YOU VOLUNTARILY AND KNOWINGLY:</strong>
      <ol>
      <li><strong>WAIVE ANY RIGHTS TO HAVE A TRIAL BY JURY TO RESOLVE ANY CLAIM OR DISPUTE ALLEGED AGAINST US OR RELATED THIRD PARTIES;</strong></li>
      <li><strong>WAIVE YOUR RIGHT TO HAVE A COURT, OTHER THAN A SMALL CLAIMS COURT, RESOLVE ANY CLAIM OR DISPUTE ALLEGED AGAINST US OR RELATED THIRD PARTIES; AND</strong></li>
      <li><strong>TO THE EXTENT PERMITTED BY APPLICABLE LAW, WAIVE YOUR RIGHT TO SERVE AS A REPRESENTATIVE, AS A PRIVATE ATTORNEY GENERAL, OR IN ANY OTHER REPRESENTATIVE CAPACITY, AND/OR TO PARTICIPATE AS A MEMBER OF A CLASS OF CLAIMANTS, IN ANY LAWSUIT FILED AGAINST US AND/OR RELATED THIRD PARTIES.</strong></li>
      </ol>
      </li>
      
     <li> Exception for Claims for Public Injunctive Relief:</strong> You or we may, but are not required to,
      submit claims for public injunctive relief under state or federal statutes that specifically provide for such
      relief to arbitration under this Arbitration Agreement.  In the event that either you or we elect to pursue such
      a claim through court proceedings, all other claims between us shall remain subject to the provisions of this
      Arbitration Agreement.</li>
      <li> <strong> Opt-Out Right:</strong> You may elect to opt out of this Arbitration Agreement by doing any of the following
      things:
      <ol style="list-style:lower-alpha">
      
      <li>In the signature block at the end of this Arbitration Agreement, writing "Opt Out" in the signature block and initialing it; or
</li><li>Sending or delivering written notice to the address on this Arbitration Agreement that you wish to opt out of this Arbitration Agreement. This written notice must be received by us by the end of the 30th calendar day after you sign this Agreement.
</li>
      
      </ol>
      </li>
      
      <li><strong> Procedure for Arbitration:</strong> Arbitration maybe heard, at the claimant's election, by:
      
      <ul>
      <li>The American Arbitration Association:<br>

 https://www.adr.org<br>

 (877) 495-4185<br>

 casefiling@adr.org</li>
      
      <li>JAMS: (800) 352-5267<br>
http://www.jamsadr.com/adr-arbitration<br>

https://www.jamsadr.com/contact



</li>
<li>or any other arbitration fonun as you and we may agree.</li>

      
      </ul>
      
      You may initiate an arbitration by contacting the arbitration forum of your choice at the contact points provided above. If you require assistance in a language other than English, or special services to accommodate a disability, please select an arbitration forum that can accommodate your needs.<br><br>


      
      <ol style="list-style:lower-alpha">
      <li>The arbitration shall be conducted by a single neutral, qualified and competent arbitrator selected by you and us under the rules of the arbitration forum selected. The arbitrator shall apply applicable substantive law consistent with the FAA and applicable statutes of limitation, and shall honor all claims of privilege recognized by law. The Arbitration shall take place in a location determined by the arbitrator the federal district of your residence.</li>
      
      <li>If you file for arbitration under this Arbitration Agreement, the only fee you may required to pay is $200, which is approximately equivalent to current court filing fees. We will bear all other of the arbitration, except for your attorneys' fees and costs. If we file for arbitration under this Arbitration Agreement, we will be required to pay all costs associated with the arbitration, except for your attorneys' fees and costs. However, if circumstances relating to the dispute (including, among other things, the size and nature of the dispute, the nature of the services that we have provided you, and your ability to pay) it would be unfair or burdensome for you to pay the arbitration filing fees, we will advance the initial filing, administration, and hearing fees required by the arbitrator, who will ultimately decide who will be responsible for paying those amounts.</li>
      <li>You can participate without representation or may choose to be represented by an attorney or other authorized representative, unless that choice is prohibited by applicable law. Because arbitration is a final, legally-binding process that may impact your legal rights, you may want to consider consulting an attorney. Each party, you and we, shall bear our own costs and expenses, including attorneys' fees, that we incur with respect to the arbitration.
</li>
<li>The Arbitrator shall allow for the discovery or exchange of non-privileged information relevant to the dispute, under the Arbitrator's supervision, prior to the arbitration hearing or submission of written presentations.
</li>
<li>Arbitrations may be decided upon written presentations, unless the amount of relief requested exceeds $25,000. The Arbitrator may consider dispositive motions, but shall generally hold a conference call among all the parties prior to permitting any written motion. The Arbitrator may hold hearings in person or by conference call, and hearings generally will not exceed one day. If you or we show good cause, the arbitrator may schedule additional hearings within seven calendar days after the initial hearing.
</li>


      </ol>
      
      
      </li>
   <li><strong>  Interpretation of this Arbitration Agreement:</strong> Any dispute as to the arbitrability of a claim shall be
      decided by the arbitrator. Any dispute as to the validity of the portion of this agreement that prohibits class
      arbitration shall be a matter for resolution by a court and not by the arbitrator. In the event that the court
      deems the portion of this agreement that prohibits class arbitration to be unenforceable, then the court shall
      retain jurisdiction over the dispute and this Arbitration Agreement shall be null and void.</li>   
      
 <li> <strong>  Statutes of Limitations:</strong> All statutes of limitations that are applicable to any claim or dispute shall apply to
      any arbitration between you and us. </li>
      
      
      <li> <strong> Attorneys' Fees:</strong> The arbitrator may, but is not required to, award reasonable expenses and attorneys' fees
      to the prevailing party if allowed by statute or applicable law and by the rules of the arbitration forum.</li>
      
      <li><strong>  Awards:</strong> The Arbitrator shall issue the award in accordance with the rules of the arbitration forum.
      Unless you and we agree otherwise, The award shall provide the concise written reasons for the decision and
      shall apply any identified, pertinent contract terms, statutes and legal precedents. The arbitrator may grant
      any remedy, relief or outcome that you or we parties could have received in court. </li>
      
      <li><strong>  Enforcement of Award:</strong> The award of the arbitrator shall be binding and final after fifteen (15) days have
      passed, and judgment upon the arbitrator's award may thereafter be entered in any court having jurisdiction.</li>
  
      
      <li><strong>  Appeal Procedure:</strong> Within fifteen (15) days after an award by the arbitrator, any party may appeal the
      award by requesting in writing a new arbitration before a panel of three neutral arbitrators designated by the
      same arbitration service. The decision of the panel of three neutral arbitrators will be immediately binding
      and final.</li>
      
      
      <li><strong>  Small Claims Court:</strong> Notwithstanding any other provision of this Arbitration Agreement, either you or
      we shall retain the right to seek adjudication in Small Claims Court of any matter within its jurisdiction. Any
      matter not within the Small Claims Court's jurisdiction shall be resolved by arbitration as provided above.
      Any appeal from a Small Claims Court judgment shall be conducted in accordance with the provisions in Section 8
      of this Arbitration Agreement or applicable law.</li>
      
      <li><strong>  Counterparts:</strong> This Arbitration Agreement may be executed in counterparts,
      each of which shall be deemed to be an original but all of which together shall be deemed to be one instrument.</li>
      </ol>
      
    <p > <strong>BY SIGNING BELOW, BORROWER AGREES TO THE TERMS AND CONDITIONS OF THIS ARBITRATION AGREEMENT</strong> </p>
 
 
     
     
     
  </div>
  <!-- Arbitration Signature -->
  <div> <a id="sigpad2" name="sigpad-2"></a> <br>
    <p> </p>
    <table class="table-responsive">
      <tbody>
        <tr>
          <td width="40%" style="border-bottom:1px solid black;padding:0 18px;"><span id="stamp-arbitration"> 
              ${primaryOwnerSignatureTag}
          &nbsp; </span> </td>
          <td width="6%">&nbsp;</td>
          <td id="stamp-arbitration-date" width="14%" style="border-bottom: 1px solid black; margin-left: 60px;"> <span id="stamp-arbitration"> 
              ${signDate}
          &nbsp; </span></td>
          <td id="40%"></td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">Borrower's Signature</td>
          <td style="padding-left: 20px; padding-right: 20px;">
            
          &nbsp;</td>
          <td style="text-align: center; font-weight: bold;">Date</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <p></p>
    <br>
    <div id="signInstructions" style="display: none;">Please click and hold your mouse to sign your signature in the box below.</div>
    <div id="signerror" style="display:none;">
      <center>
        <p style="color: red;"><strong>Please sign Promissory Note.</strong></p>
      </center>
    </div>
    <br>
  </div>
</div>
        </body>
        
        </html>`;
    return html;
  }
}
