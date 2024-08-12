import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';
import {Save} from './dto/save.dto'
import { userConsentRepository } from '../../repository/userConsent.repository';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class InitialNoteService {
    constructor(
        @InjectRepository(userConsentRepository)
        private readonly userConsentRepository: userConsentRepository,
    ){

    }

    async get(id){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select 
            t."createdat" as createdat,
            t.ref_no as ref_no, 
            t2."firstname" as firstname,
            t2."lastname" as lastname,
            t2."streetaddress" ,t2.unit ,t2.city ,t2.state,t2."zipcode" 
            from loan t join customer t2 on t2.user_id=t.user_id where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'waiting' and t.signature is null and t.datesignature is null and t.id = '${id}' 
            `);
            // console.log('rawData', rawData);
            
            if(rawData.length>0){
                return {"statusCode": 200, data:rawData };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async save(save:Save,data){
        const entityManager = getManager();
        try{
            await this.userConsentRepository.save(data)
            const rawData = await entityManager.query(`select count(*) as count from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+save.loan_id+"'");
            const user_id = await entityManager.query(`select "user_id" as user_id from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'waiting' and `+"id = '"+save.loan_id+"'");
            if(rawData[0]['count']>0 && user_id.length>0){
                await entityManager.query(`UPDATE loan
                SET status_flag='approved'::loan_status_flag_enum::loan_status_flag_enum,
                signature = '${save.signature}',
                datesignature = '${save.date}'
                WHERE `+"id = '"+save.loan_id+"'");
                await entityManager.query(`UPDATE user
	SET active_flag='Y'::user_active_flag_enum::user_active_flag_enum
	WHERE id='${user_id[0]['user_id']}';`)

            //console.log(rawData)
                return {"statusCode": 200 };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async savePromissoryNote(
        id,signature,date
      ) {
        let entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select 
            t."createdat" as createdat,
            t.ref_no as ref_no, 
            t2."firstname" as firstname,
            t2."lastname" as lastname,
            t2."streetaddress" ,t2.unit ,t2.city ,t2.state,t2."zipcode" 
            from loan t join customer t2 on t2.user_id=t.user_id where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'waiting' and t.signature is null and t.datesignature is null and t.id = '${id}' 
            `);
            // console.log('rawData', rawData);
            
            if(rawData.length>0){
                let pn = new SignningPromissoryNote(rawData,signature,date);
                let html = pn.getHtml();
                return {
                    statusCode: 200,
                    data: html,
                };
            }else{
                return {"statusCode": 500, "message": ['This Loan Id Not Exists'], "error": "Bad Request"};
            }
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}


export class SignningPromissoryNote {
    data: any;
    signature:any;
    date:any;
    constructor(res,signature,date) {
      var d = new Date(res[0]['createdat'])
        let data = {
          name : res[0]['firstname']+" "+res[0]['lastname'],
          ref_no : "LON_"+res[0]['ref_no'],
          date:((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '/' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate())) + '/' + d.getFullYear(),
          addr1:res[0]['unit']+", "+res[0]['streetaddress'],
          addr2:res[0]['city']+", "+res[0]['state']+", "+res[0]['zipcode']
        }
      this.data = [data];
      this.signature=signature;
      this.date = date;
    }
    getHtml() {
      this.data;
      let htmlData = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>Bank Loan Program Credit</title>
      <style type="text/css">
      <!--
      body {
        margin-left: 0px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        font-family:Arial, Helvetica, sans-serif;
        line-height:20px;
        font-size:12px
      }
      -->
      
      </style>
      </head>
      <body>
      <div style="border: 1px solid #e7e7e7;    margin: 20px;">
        <div style="text-align:center;  padding:10px; font-size:20px" >Bank Loan Program Credit</div>
        <div style="text-align:center;  padding:10px">Agreement - Personal Loan</div>
        <div  style="padding:20px">
          <table width="50%" border="1" align="center" cellpadding="3" cellspacing="0" style="border-collapse:collapse" bordercolor="#CCCCCC">
            <tr>
              <td height="30px" align="center">Loan Date</td>
              <td align="center" valign="middle">Account ID</td>
            </tr>
            <tr>
              <td align="center" valign="middle"><div>${this.data[0]['date']}</div></td>
              <td align="center" valign="middle"><div>${this.data[0]['ref_no']}</div></td>
            </tr>
          </table>
        </div>
        <div style="padding-bottom:20px;     padding-left: 20px;">
          <table width="50%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td height="30px" style="width:30%"><strong>Borrower</strong></td>
              <td>${this.data[0]['name']}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>Address</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>${this.data[0]['addr1']}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>${this.data[0]['addr2']}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>No alterations, scratch outs or white-outs will be accepted on this form.)</td>
            </tr>
          </table>
        </div>
        <div style="    padding-left: 20px;">In this Credit Agreement, the words “I,” “me,” “my,” and “mine” mean the Borrower. The words “you,” “your,” and “Lender” mean Bank, Banktown, its successors and assigns, and any other holder of this Application and Credit Agreement.</div>
        <div style="padding:20px 20px">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><strong>This is a consumer credit transaction.</strong></td>
              <td><strong>Non-negotiable consumer note.</strong></td>
              <td><strong>This is a personal loan.</strong></td>
            </tr>
          </table>
        </div>
        <div style="    padding-left: 20px;">FEDERAL TRUTH IN LENDING ACT DISCLOSURES</div>
        <div style="padding:20px 20px; border:1px solid #CCCCCC;     margin: 20px;">
          <table width="100%" border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:20px">
            <tr>
              <td width="25%"><div style="padding:10px">
                  <div style="padding-bottom:20px"><strong>ANNUAL PERCENTAGE RATE</strong></div>
                  <div  style="padding-bottom:20px; min-height: 80px;">The cost of my credit as a yearly rate.</div>
                  <div style="text-align:right">%</div>
                </div></td>
              <td width="25%" align="left" valign="top"><div style="padding:10px">
                  <div style="padding-bottom:20px"><strong>FINANCE CHARGE</strong></div>
                  <div  style="padding-bottom:20px; min-height: 80px;">The dollar amount the credit will cost me.</div>
                  <div style="text-align:right">$</div>
                </div></td>
              <td width="25%" align="left" valign="top"><div style="padding:10px">
                  <div style="padding-bottom:20px"><strong>Amount Financed </strong></div>
                  <div  style="padding-bottom:20px; min-height: 80px;">The amount of credit provided to me or on my behalf.</div>
                  <div style="text-align:right">$</div>
                </div></td>
              <td width="25%" align="left" valign="top"><div style="padding:10px">
                  <div style="padding-bottom:20px"><strong>Total of Payments </strong></div>
                  <div  style="padding-bottom:20px; min-height:80px">The amount I will have paid after I have made all scheduled payments.</div>
                  <div style="text-align:right">$</div>
                </div></td>
            </tr>
          </table>
          All numerical disclosures except the Amount Financed and the late payment disclosure are estimates.<br />
          <br />
          My Payment Schedule will be: <br />
          <br />
          <table   width="100%" border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; margin-bottom:20px;     ">
            <tr>
              <td>Number of Payments</td>
              <td>Amount of Payments</td>
              <td>When Payments Are Due</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>$</td>
              <td>Monthly, beginning</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>$</td>
              <td>&nbsp;</td>
            </tr>
          </table>
          LATE CHARGE: If any payment is not made within 10 days after it is due, I will be charged 5% of the unpaid balance of theinstallmentdue,or$10,whicheverisless.<br />
          <br />
          PREPAYMENT: If I pay off all or part of my loan early,I will not have to pay a penalty, and I will not be entitled to are fund of part of the finance charge.I may refer to my contract documents for any additional information about nonpayment, default, any repayment in full before the scheduled date,and prepayment refunds and penalties. </div>
        <div>
          <table width="50%"  border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; margin:20px 20px">
            <tr>
              <td><strong>ITEMIZATION OF AMOUNT FINANCED</strong></td>
            </tr>
            <tr>
              <td>Amount Given to me Directly<br />
                1. $</td>
            </tr>
            <tr>
              <td><strong>Amount Paid to Others on My
                Behalf*</strong></td>
            </tr>
            <tr>
              <td>Amount Paid on my Account <br />
                2. $</td>
            </tr>
            <tr>
              <td><strong>TOTAL AMOUNT FINANCED</strong><br />
                (Sum of 1 and 2 above)<br />
                3. $</td>
            </tr>
            <tr>
              <td>Prepaid Finance Charge<br />
                4. $</td>
            </tr>
            <tr>
              <td> Principal Loan Amount <br />
                (Sum of 3 and 4)<br />
                5.$</td>
            </tr>
            <tr>
              <td>* Lender may retain a portion of these amounts.</td>
            </tr>
          </table>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> PROMISE TO PAY</div>
          <div  style="   padding:10px">I promise to pay to you the total principal sum of the Loan which includes amounts disbursed under the terms of this Credit Agreement (the “Agreement”), interest at % (the “Interest Rate”) on such principal sum (including any prepaid finance charge or loan origination fee), interest (at the same interest rate) on any unpaid interest added to the principal balance, returned payment fees, late charges and other fees, charges and costs as provided in this Agreement.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> IMPORTANT – READ THIS CAREFULLY</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> When you receive any signed Application, you are not agreeing to lend me money. You have the right not to make a loan, not to make any disbursement on a loan, or to lend an amount less than the Loan Amount Requested.</li>
              <li style="padding-bottom:15px"> If you agree to make a Loan to me, my contractual obligation on this Note will begin when loan proceeds are disbursed to me.</li>
              <li style="padding-bottom:15px"> HOW I AGREE TO THE TERMS OF THIS LOAN. By preparing and signing this Note, and submitting it to you, either directly or through some other person, I am requesting that you make this Loan to me in the Loan Amount Requested and on the terms described in this Note. I may cancel the application without any fee or penalty prior to funding of the loan, as long as I provide you with sufficient advance notice to stop the loan funding.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> DEFINITIONS</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> “Application” means the written, on-line or oral (including telephonic) request that I make to you for a Loan.</li>
              <li style="padding-bottom:15px"> “Capitalized Interest” means accrued and unpaid interest that you add to the principal balance of my Loan.</li>
              <li style="padding-bottom:15px"> “Disbursement Date” means the date on which you lend money to me in consideration for this Note and will be the date of my loan check or electronic funds transfer.</li>
              <li style="padding-bottom:15px"> “Disclosure Statement” means the Federal Truth in Lending Disclosure Statement shown at the beginning of this Agreement, commencing on Page 1.</li>
              <li style="padding-bottom:15px"> “Full Principal and Interest Option” means a Repayment Option that does not allow the deferral of principal payments, but instead requires
                me to make equal monthly amortizing payments of principal and interest during the Principal Repayment Period.</li>
              <li style="padding-bottom:15px"> “Interest Only Option” means the Repayment Option that allows me to defer repayment of principal and requires me to make monthly interest-only payments in the amount of the accrued interest on the principal amount of my Loan during the Interest-Only Period. If I choose this option, the Principal Repayment Period of my Loan will begin on the day immediately following the expiration of the Interest-Only Period.</li>
              <li style="padding-bottom:15px"> “Interest-Only Period” means the period during which monthly interest-only payments in the full amount of the accrued interest on the principal balance of the Loan shall be due and payable. The Interest-Only Period will begin immediately following the Disbursement Date and continue for each consecutive month thereafter for the first half (1/2) of the Total Repayment Period.</li>
              <li style="padding-bottom:15px"> “Loan” means all principal sums disbursed, as may be designated by you, plus interest on such principal sums, interest on any Capitalized Interest, and other charges and fees that may be included or become due as provided in this Note.</li>
              <li style="padding-bottom:15px"> “Loan Amount Requested” means the dollar amount of the Loan requested at the time of the Application.</li>
              <li style="padding-bottom:15px"> “Note” means this Agreement setting forth the terms applicable to my Loan. The term “Note” also includes the Application unless
                otherwise provided.</li>
              <li style="padding-bottom:15px"> “Principal Repayment Period” means the period during which amortizing monthly payments of principal and interest shall be due and payable until the Loan is repaid in full. The Principal Repayment Period for a Loan for which the Full Principal and Interest Option has been chosen begins on the Disbursement Date and continuing until the end of the Total Repayment Period. The Principal Repayment Period for a Loan for which the Interest-Only Option has been chosen begins on the day following the expiration of the Interest-Only Period and continuing for remainder of the Total Repayment Period.</li>
              <li style="padding-bottom:15px"> “Repayment Option” means the type of payments on my Loan that I have chosen to make of either interest or principal and interest.</li>
              <li style="padding-bottom:15px"> “Total Repayment Period” means the period beginning on the Disbursement Date and continuing for the number of scheduled installment payments as set forth in the Disclosure Statement.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">  INTEREST</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> Accrual – Interest will begin to accrue as of the Disbursement Date on the principal amount of this loan outstanding from time to time. Interest will be calculated on a daily simple interest basis, according to the outstanding principal balance each day of the term of the Loan. The daily interest rate will be equal to the annual interest rate in effect on that day, divided by the actual number of days in the year (365 or 366 days).</li>
              <li style="padding-bottom:15px"> Calculation. The Interest Rate is identified above and will not increase or decrease over the life of my Loan except as described below. If at any time the Interest Rate as provided in this Section is not permitted by applicable law, interest will accrue at the highest rate allowed by applicable law.</li>
              <li style="padding-bottom:15px"> Capitalization – I agree that although the Loan Origination Fee described in Paragraph F will be included in the principal balance of my loan, you will deduct the Loan Origination Fee from the amount of my Loan that you will disburse to me or on my behalf. I also agree that you will add all accrued and unpaid interest to the principal balance of my Loan at the end of any authorized period of forbearance. In all cases, thereafter, interest will accrue on the new principal balance. In addition, should I default under the terms of this Note, you may, at your option, add all accrued and unpaid interest to the principal balance of my Loan upon such default. Such Capitalized Interest is thereafter considered principal and interest will accrue on the new principal balance at the Interest Rate. In addition, if I am in default under this Note, you may, at your option, add any unpaid late charges, Returned Payment Fees or other charges outstanding at the time of default to the principal amount of my Loan.</li>
              <li style="padding-bottom:15px"> Annual Percentage Rate (“APR”) – The APR for my Loan will be disclosed to me on my Disclosure Statement. The APR may be higher than the Interest Rate described above because the APR will include any fee that is charged for my Loan as well as the rate at which interest accrues.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">  TERMS OF REPAYMENT</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> Repayment Options – I acknowledge that I may choose either the Interest Only Option or Full Principal and Interest Option, subject to my eligibility. Not all Borrowers are eligible for the Interest Only Option. The Repayment Option I choose will determine when the Principal Repayment Period under the Loan will commence. I understand that my choice of the Repayment Option will be made during the Application process.</li>
              <li style="padding-bottom:15px"> Interest Only Option– If I am eligible and have selected the Interest Only Option, I will make consecutive monthly payments during the Interest-Only Period on or before the due dates specified in the monthly statements you will send me. The first payment during the Interest- Only Period will be due thirty (30) to forty-five (45) days following the Disbursement Date. The amount of the monthly payments will be determined at the time the Interest-Only Period begins to equal the accrued and unpaid interest on the disbursed amount of my Loan at the Interest Rate then in effect, but not less than the Minimum Payment described below. The monthly interest payment amount so determined will be specified in the monthly statements you will send to me. The Principal Repayment Period of my Loan will begin following the expiration of the Interest-Only Period and the monthly payments due and payable during the Principal Repayment Period will be as described in this Note under “Full Principal and Interest Option” below. The first payment during the Principal Repayment Period will be due thirty (30) to forty- five (45) days following the expiration of the Interest-Only Period, as specified in the monthly statement you send me. In order to elect to make interest-only payments, I will give notice of the election and pay the amount due as shown on my monthly billing statement.</li>
              <li style="padding-bottom:15px"> Full Principal and Interest Option – If I have selected the Full Principal and Interest Option, I will make consecutive monthly payments during the Principal Repayment Period on or before the due dates specified in the monthly statements you will send me until I have paid all of the principal and interest and all other charges and fees payable under this Note. The first payment during the Principal Repayment Period will be due and payable between thirty (30) to forty-five (45) days following the Disbursement Date. The amount of the monthly payments will be determined at the time the Principal Repayment Period begins to equal the amount necessary to amortize the disbursed and remaining unpaid principal balance (including any Capitalized Interest or other capitalized charges and fees added to the principal amount) of the Loan in equal installments of principal and interest on the unpaid principal balance at the Interest Rate then in effect over the number of months in the Principal Repayment Period, but not less than the Minimum Payment described below. The monthly amortizing payment amount so determined will be specified in the monthly statements you will send to me.</li>
              <li style="padding-bottom:15px"> Minimum Repayment – Notwithstanding the repayment terms described above, I agree that my monthly payment will never be less than
                $75.00 or the unpaid balance, whichever is less. I understand that this may result in the Principal Repayment Period being less than sixty
                (60) or one hundred and twenty (120) months as applicable.</li>
              <li style="padding-bottom:15px"> Amounts Owing at the End of the Principal Repayment Period – Since interest accrues daily upon the unpaid principal balance of my Loan, if I make payments after my payment due dates, I may owe additional interest. If I have not paid my late charges, I will also owe additional amounts for those late charges. In such cases you will increase the amount of my last monthly payment to the amount necessary to repay my Loan in full.</li>
              <li style="padding-bottom:15px"> Payments – Payments will be applied first to accrued interest, then to principal, and the remainder to late charges, other fees and other charges.</li>
              <li style="padding-bottom:15px"> Other Charges - If any part of a monthly payment remains unpaid for a period of more than 10 days after the payment due date, I will pay a late charge of 5% of the unpaid amount of the payment due or $10.00, whichever is less. I will also pay a NSF Fee of $15.00 for each payment on this Note returned for any reason.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">  LOAN ORIGINATION FEE</div>
          <div  style="   padding:10px">I will pay a Loan Origination Fee to you when the loan proceeds are disbursed. The amount of the Loan Origination Fee is equal to the Loan amount multiplied by 2.0%. The amount of the Loan Origination Fee will be deducted from the disbursed amount of my Loan, but will be included in the principal balance of my Loan. If I prepay this loan in full or in part, I will not be entitled to any refund of any part of the Loan Origination Fee unless otherwise required by applicable law.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">  RIGHT TO PREPAY</div>
          <div  style="   padding:10px">I have the right to prepay all or any part of my Loan at any time without penalty. Any partial prepayment will be applied to the accrued interest and then to the principal of my Loan and will not reduce the next payment due on my Loan.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> REPAYMENT PLAN CHANGE MODIFICATION</div>
          <div  style="   padding:10px">If I am in default as described below, I may request that you modify these terms. I understand that such modification would be solely at your option and subject to any requirements you may establish. If I have selected the Interest Only Option, I may request that you extend the Interest Only Period for up to 90 days. If I have selected the Full Principal and Interest Option, I may request that you change my payments to interest-only payments. I understand that I will remain responsible for all interest accruing during any period of forbearance and that you will add any interest that I do not pay during any forbearance period to the principal balance as described in paragraph D.3. If I originally selected the Full Principal and Interest Option and you grant me a modification, any such change to interest-only payments would be for half (1/2) of the remaining Total Repayment Period or ninety (90) days, whichever is longer. I understand that in some instances this will cause the Total Repayment period to extend beyond the originally agreed upon term. I also understand and agree that after the modification period ends, you will recalculate my monthly payments to be the amount necessary to amortize the outstanding balance of my Loan at the Interest Rate over the remainder of the Total Repayment Period and that those payments may be greater than those shown in the Disclosure Statement. I also agree that, if I originally selected the Full Principal and Interest Option and you have granted me a modification, my Interest Rate will increase by 2.0 percentage points and remain at the increased level for the remainder of the Total Repayment Period.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">  DEFAULT AND REMEDIES</div>
          <div  style="   padding:10px">Except as provided below and to the extent permitted by applicable law, I will be in default under the terms of this Note (subject to any applicable law which may give me a right to cure my default) if: (1) I have more than 1 full payment past due and this amount remains unpaid for more than 14 days after its due date, or I fail to pay my first or last payment within 40 days after such payment is due, (2) I break any of my other promises in this Note that materially impairs my ability to pay the amounts owed, (3) any bankruptcy proceeding is begun by or against me, or I assign any assets for the benefit of my creditors, (4) I make any false statement in applying for this Loan or at any time thereafter that material impairs my ability to pay the amounts owed. If I live in Idaho, Kansas, Maine, Nebraska, or South Carolina, I will be in default if I fail to make a payment when due or the prospect of my payment or performance is significantly or materially impaired. If I live in Iowa, I will be in default if I fail to make a payment within ten (10) days of its due date or if the prospect of my payment or performance is significantly or materially impaired. If I live in West Virginia, I will be in default if I fail to make a payment within five (5) days of its due date or if I otherwise fail to perform pursuant to this Credit Agreement.<br />
            <br />
            If I default you have the right to give me notice that the whole outstanding principal balance, accrued interest, and all other amounts payable to you under the terms of this Note, are due and payable at once but if I live in Virginia no sooner than 10 days after the payment due date and if I live in the District of Columbia no sooner than 30 days after the payment due date. You also have the right to cancel any disbursements not yet made. If I default, I will be required to pay interest on this Loan accruing after default. The interest rate after default will be subject to adjustment in the same manner as before default. If I default, you may also, at your option, add all accrued and unpaid interest to the principal balance of my Loan upon such default.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> CREDIT REPORTING AND INFORMATION SHARING</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> You may report information about my account to credit bureaus. Late payments, missed payments or other defaults on my account may be reflected in my credit report.</li>
              <li style="padding-bottom:15px"> I understand that the reporting of information about my account to credit reporting agencies may adversely affect my credit rating and my ability to get other credit.</li>
              <li style="padding-bottom:15px"> I also agree that you may report my name, the fact that I have taken a Loan from the Bank and information about my payment history on my account, including if I default, to any subsequent holders, successors in interest or other persons or investors who own a participation interest or other interest in my Loan.</li>
              <li style="padding-bottom:15px"> I must update the information on my Application whenever you ask me to do so.</li>
              <li style="padding-bottom:15px"> I authorize you from time to time to request and receive from others credit related information about me (and about my spouse if I live in a community property state).</li>
              <li style="padding-bottom:15px"> I may refer to your Privacy Policy for an explanation of how you gather and share my information.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> ADDITIONAL AGREEMENTS</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> I understand that the Lender is an FDIC-insured Institution located in Wisconsin and that this Note will be entered into in the same state. CONSEQUENTLY, THIS NOTE WILL BE GOVERNED BY FEDERAL LAW APPLICABLE TO AN FDIC-INSURED INSTITUTION AND TO THE EXTENT NOT PREEMPTED BY FEDERAL LAW, THE LAWS OF THE STATE OF WISCONSIN, WITHOUT REGARD TO CONFLICT OF LAW RULES.</li>
              <li style="padding-bottom:15px"> Unless I am a covered borrower as defined by the Military Lending Act, 10 U.S.C. § 987, and to the extent permitted by applicable law, my responsibility for paying this Note is unaffected by the liability of any other person to me or by your failure to notify me that a required payment has not been made. You may delay, fail to exercise, or waive any of your rights on any occasion without losing your entitlement to exercise the right at any future time, or on any future occasion. You will not be obligated to make any demand upon me, send me any notice, present this Note to me for payment or make protest of non-payment to me before suing to collect on this Note if I am in default, and to the extent permitted by applicable law, I hereby waive any right I might otherwise have to require such actions. To the extent permitted by applicable law, I agree that you are not required to: (a) Demand payment of amounts due; (b) Give notice that amounts due have not been paid or have not been paid in the correct amount, time or manner; or (c) Give notice that you intend to make, or are making, this Note immediately due. Without losing any of your rights under this Note, you may accept late payments or partial payments. <strong>I will not send you partial payments marked “paid in full”, “without recourse” or with other similar language unless those payments are marked for special handling and sent to 375 Alabama Street, Suite 360, San Francisco, CA 94110 or to such other address as I may be given in the future.</strong></li>
              <li style="padding-bottom:15px"> <strong>TCPA Consent</strong> – Notwithstanding any current or prior election to opt in or opt out of receiving telemarketing calls or SMS messages (including text messages) from you, your agents, representatives, affiliates, subsequent holders, successors in interest, or anyone calling on your behalf, I expressly consent to be contacted by you, your agents, representatives, affiliates, subsequent holders, successors in interest, or anyone calling on your behalf for any and all purposes arising out of or relating to my Loan, at any telephone number, or physical or email or electronic address I provide or at which I may be reached. Telephone numbers I provide include those I give to you, those from which I or others contact you with regard to my account, or which you obtain through other means. I agree you may contact me in any way, including SMS messages (including text messages) calls using prerecorded messages or artificial voice, and calls and messages delivered using automatic telephone dialing systems (auto-dialer) or an automatic texting system. Automated messages may be played when the telephone is answered, whether by me or someone else. In the event that agent or representative calls, he or she may also leave a message on my answering machine, voice mail, or send one via text. I consent to receive SMS messages (including text messages), calls and messages (including prerecorded and artificial voice and autodialed) from you, your agents, representatives, affiliates, subsequent holders, successors in interest, or anyone calling on your behalf at the specific number[s] I have provided to you, or numbers you can reasonably associate with my loan (through skip-trace, caller ID capture or other means), with information or questions about your application or loan. I certify, warrant and represent that the telephone numbers that I have provided to you are my contact numbers. I represent that I have the authority to provide this consent because I am either the subscriber of the telephone number(s) or the customary user of each of the telephone numbers I have provided to you who has the authority to provide consent. I agree to promptly alert you whenever I stop using a particular telephone number. I also consent to you and your agents, representatives, affiliates or anyone calling on your behalf to communicate with any persons listed in my Application as employment and personal references. YOU AND YOUR AGENTS, REPRESENTATIVES, AFFILIATES, SUBSEQUENT HOLDERS, SUCCESSORS IN INTEREST AND ANYONE CALLING ON YOUR BEHALF MAY USE SUCH MEANS OF COMMUNICATION DESCRIBED IN THIS SECTION EVEN IF I WILL INCUR COSTS TO RECEIVE SUCH PHONE MESSAGES, TEXT MESSAGES, E-MAILS OR OTHER MEANS.</li>
              <li style="padding-bottom:15px"> <strong>Call Recording</strong> – I agree that you and your agents, representatives, affiliates, successors in interest or anyone calling on your behalf may contact me on a recorded line.</li>
              <li style="padding-bottom:15px"> I may not assign this Note or any of its benefits or obligations. You may assign this Note (including my Application) or any of its benefits or obligations at any time. The terms and conditions of my Note apply to, bind and inure to the benefits of your successors and assigns.</li>
              <li style="padding-bottom:15px"> The terms and conditions set forth in my Note and the Application constitute the entire agreement between you and me.</li>
              <li style="padding-bottom:15px"> If any provision of this Note is held invalid or unenforceable, that provision shall be considered omitted from this Note without affecting the validity or enforceability of the remainder of this Note.</li>
              <li style="padding-bottom:15px"> A provision of this Note may only be modified if jointly agreed upon in writing by you and me. Any modification will not affect the validity or enforceability of the remainder of this Note.</li>
              <li style="padding-bottom:15px"> All parties to this Note agree to fully cooperate and adjust all typographical, computer, calculation, or clerical errors discovered in any or all of the loan documents including the Note. In the event this procedure is used, I will be notified and receive a corrected copy of the changed document.</li>
              <li style="padding-bottom:15px"> All payments on my Loan will be made in United States dollars, and if paid by check or draft, drawn upon a financial institution located in the United States. My obligation to make monthly payments in accordance with Section E is not affected by any withholding taxes required to be paid under any foreign law, and notwithstanding any such law that requires withholding taxes on my payments under my Loan, I agree to make all required payments under this Loan to you or any subsequent holder.</li>
              <li style="padding-bottom:15px"> Waiver by Lender: You waive (give up) any right to claim a security interest in any property to secure this Note. This does not affect any right to offset as a matter of law.</li>
              <li style="padding-bottom:15px"> I understand that the amount of my Loan, if approved, will be the sum of the Loan amount approved by you, including any loan origination fee imposed in connection with my Loan.</li>
              <li style="padding-bottom:15px"> <strong>Limits on Interest, Fees, Charges or Costs </strong>– If a law applies to this Loan and sets maximum limits on interest, fees, charges, or costs collected or to be collected in connection with this Loan:
                <ul>
                  <li> Any such interest, fees, charges or costs which exceed permitted limits shall be reduced by the amount necessary to comply with the permitted limits, and</li>
                  <li> Any sums already collected from me which exceed permitted limits will be refunded to me. You may choose to make the refund by reducing the amounts I owe under this Agreement.</li>
                </ul>
              </li>
              <li style="padding-bottom:15px"> If I sign this Note electronically, then: (i) You agree to keep an electronic record of the signed Note and provide a printed copy to me upon request, and (ii) I agree to download and print a copy of this Note for my records when I sign it. I understand and agree that my electronic signature or a facsimile of my signature will be just as valid as my handwritten signature on a paper document.</li>
              <li style="padding-bottom:15px"> NOT NEGOTIABLE. <em>You and I agree that this Note shall be deemed a credit agreement and shall not be considered a promissory note or other “instrument” as defined in Article 3 of the Uniform Commercial Code as enacted in Wisconsin, or any other state, and that the transfer of this Note, the Loan or any interest therein, shall be governed by Article 9 of the Uniform Commercial Code as enacted in Wisconsin or any other state. The delivery or possession of this Note shall not be effective to transfer any interest in the Lender’s rights under this Note or to create or affect any priority of any interest in the Lender’s rights under this Note over any other interest in the Lender’s rights under this Note.</em></li>
              <li style="padding-bottom:15px"> I authorize my lender, subsequent holder, or their agents to: (1) advise the marketing agent, if any, that solicited me for a Loan of the status of this Application, (2) release information and make inquiries to the persons I have listed in my Loan Application as employers and references, (3) verify my credit and employment history and (4) gather and share from time to time credit-related, employment and other information about me (including any information from the Note or about this Loan or my payment history) from and with consumer reporting agencies, and others in accordance with applicable law; I also authorize my creditors and my past, current or future employers to answer questions about their credit experience or work history with me. My authorization under this Section K applies to this Loan, any future loans that may be offered to me by you, any updates, renewals or extensions of this Loan that may be offered to me, any hardship forbearance of this Loan or any future loans that may be requested by me, and for any review or collection of this Loan or any future loans that may be offered to me. I understand that a credit report is obtained for this loan request. If you agree to make this Loan to me, a consumer credit report may be requested or used in connection with renewals or extensions of any credit for which I have applied, reviewing my Loan, taking collection action on my Loan, or legitimate purposes associated with my Loan. If I live in a community property state, I authorize you to gather credit- related information from others about my spouse. If I ask you, you will tell me if you have requested information about me (or about my spouse if applicable) from a consumer reporting agency and provide me with the name and address of any agency that furnished you with a report.</li>
              <li style="padding-bottom:15px"> I authorize you and your agents to verify my social security number with the Social Security Administration (SSA) and, if the number on my loan record is incorrect, then I authorize SSA to disclose my correct social security number to these parties.</li>
              <li style="padding-bottom:15px"> I agree that if I select the Full Principal and Interest Option, and I make payments of the full amount due on my Loans through an automatic debit from my checking or savings account, you will reduce my Interest Rate by 0.25 percentage points. I also agree that, if I have qualified for this Interest Rate reduction, and if I have canceled the automatic debits, you will increase my Interest Rate by 0.25 percentage points. I agree that the benefit is not available if I select the Interest-Only Option or during any period of Forbearance, or Repayment Plan Change Modification to the Interest-Only Option.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px"> NOTICES</div>
          <div  style="   padding:10px">
            <ol>
              <li style="padding-bottom:15px"> I will send written notice to you, or any subsequent holder of this Note, within ten (10) days after any change in my name, address or enrollment status.</li>
              <li style="padding-bottom:15px"> Any notice required to be given to me by you will be effective when it is deposited in the U.S. mail or sent via electronic mail to the address on record, unless otherwise required by applicable law.</li>
            </ol>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">N. CERTIFICATION OF BORROWER</div>
          <div  style="   padding:10px">I declare under penalty of perjury under the laws of the United States of America that the following is true and correct. I certify that the information contained in my Application and Note is true, complete and correct to the best of my knowledge and belief and is made in good faith.<br />
            <br />
            TO THE EXTENT PERMITTED UNDER FEDERAL LAW, YOU AND I AGREE THAT EITHER PARTY MAY ELECT TO ARBITRATE AND REQUIRE THE OTHER PARTY TO ARBITRATE ANY CLAIM UNDER THE FOLLOWING TERMS AND CONDITIONS, WHICH ARE PART OF THIS AGREEMENT. THIS ARBITRATION AGREEMENT DOES NOT APPLY IF, AM) I AM A COVERED BORROWER AS DEFINED BY THE MILITARY LENDING ACT, 10 U.S.C. § 987. IF I WOULD LIKE MORE INFORMATION ABOUT WHETHER I AM COVERED BY THE MILITARY LENDING ACT, IN WHICH CASE THIS ARBITRATION AGREEMENT DOES NOT APPLY TO ME, I MAY CONTACT <a href="mailto:arbitratration@XXXXlending.com">arbitratration@XXXXlending.com</a></div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">O. ARBITRATION AGREEMENT</div>
          <div  style="   padding:10px"><strong>Please read carefully. Except as expressly provided below, I agree any claim, dispute or controversy arising out of or related to (a) my Loan, my Application, this Agreement, my acceptance of the Loan, or my Disclosure Statement or (b) any relationship resulting from my Loan, or any activities in connection with my Loan, or (c) the disclosures provided or required to be provided in connection with my Loan (including, without limitation, the Disclosure Statement), or the underwriting, servicing or collection of my Loan, or
            (d) any insurance or other service related to my Loan, or (e) any other agreement related to my Loan or any such service, or (f) breach of this Agreement or any other such agreement, whether based on statute, contract, tort or any other legal theory (collectively, any “Claim”) shall be, at my or your election, submitted to and resolved on an individual basis by binding arbitration under the Federal Arbitration Act, 9 U.S.C. §§ 1 et seq. (the “FAA”) before the American Arbitration Association (“AAA Rules”) under its Consumer Arbitration Rules in effect at the time the arbitration is brought, or before any other party that you and I agree to in writing, provided that such party must not have in place a formal or informal policy that is inconsistent with or purports to override the terms of this Arbitration Agreement. The AAA Rules are available online at <a href="http://www.adr.org/" target="_blank">www.adr.org</a>. If the AAA cannot serve as administrator and we cannot agree on a replacement, a court with jurisdiction will select the administrator or arbitrator. For purposes of this Section P, the terms “you,” “your,” and “yours” and “Lender” include the Lender, any other subsequent holder of my Loan, and all of Bank of Lake Mill’s or subsequent holder’s and their officers, directors, employees, affiliates, subsidiaries, and parents. These terms also include any party named as a codefendant with you in a Claim asserted by me, such as loan servicers or debt collectors. “Claim” has the broadest possible meaning, and includes initial claims, counterclaims, crossclaims and third- party claims. It includes disputes based upon contract, tort, consumer rights, fraud and other intentional torts, constitution, statute, regulation, ordinance, common law and equity (including claims for injunctive or declaratory relief). However, “Claim” does not include (A) any individual action brought by me in small claims court or my state’s equivalent court, unless such action is transferred, removed or appealed to a different court, or (B) disputes about the validity, enforceability, coverage or scope of this Arbitration Agreement or any part thereof, which are for a court to decide, provided that disputes about the validity or enforceability of the Loan Agreement as a whole are for the arbitrator to decide.</strong><br />
            <br />
            RIGHT TO REJECT: I may reject this Arbitration Agreement by emailing a signed rejection notice within sixty (60) days after the Disbursement Date to <a href="mailto:arbitration@XXXXXlending.com">arbitration@XXXXXlending.com</a>. Any rejection notice must include my name, address, e-mail address, telephone number and loan or account number.<br />
            <br />
            IMPORTANT DISCLOSURE AND JURY TRIAL WAIVER: IF EITHER YOU OR I CHOOSE ARBITRATION, NEITHER PARTY WILL HAVE THE RIGHT TO A JURY TRIAL, TO ENGAGE IN DISCOVERY EXCEPT AS PROVIDED IN THE APPLICABLE ARBITRATION RULES, OR OTHERWISE TO LITIGATE THE DISPUTE OR CLAIM IN ANY COURT (OTHER THAN IN AN ACTION TO ENFORCE THE ARBITRATION AGREEMENT OR THE ARBITRATOR’S AWARD). FURTHER, I WILL NOT HAVE THE RIGHT TO PARTICIPATE AS A REPRESENTATIVE OR MEMBER OF ANY CLASS OF CLAIMANTS PERTAINING TO ANY CLAIM SUBJECT TO ARBITRATION. THE ARBITRATOR’S DECISION WILL BE FINAL AND BINDING EXCEPT FOR ANY APPEAL RIGHT UNDER THE FAA. OTHER RIGHTS THAT YOU OR I WOULD HAVE IN COURT ALSO MAY NOT BE AVAILABLE IN ARBITRATION. <br />
            <br />
            CLASS ACTION WAIVER: IF EITHER YOU OR I ELECT TO ARBITRATE A CLAIM, NEITHER YOU NOR I WILL HAVE THE RIGHT TO PARTICIPATE IN A CLASS ACTION, PRIVATE ATTORNEY GENERAL ACTION OR OTHER REPRESENTATIVE ACTION IN COURT OR
            IN ARBITRATION, EITHER AS A CLASS REPRESENTATIVE OR CLASS MEMBER. Further, unless both you and I agree otherwise in writing, the arbitrator may not join or consolidate Claims with claims of any other persons. No arbitrator shall have authority to conduct any arbitration in violation of this provision or to issue any relief that applies to any person or entity except you and me individually.<br />
            <br />
            PROCEDURES: If I reside in the U.S., any arbitration hearing shall take place within the federal judicial district in which I reside. If I reside outside the United States, I agree that any arbitration hearing shall take place in San Francisco, California. Each party will bear the expense of its own attorneys, experts and witnesses, regardless of which party prevails, unless applicable law or this Agreement gives a right to recover any of those fees from the other party. If my Claim is for $10,000 or less, you agree that I may choose whether the arbitration will be conducted solely on the basis of documents submitted to the arbitrator, through a telephonic hearing or by an in-person hearing as established by the AAA Rules. If my Claim exceeds $10,000, the right to a hearing will be determined by the AAA Rules. All fees and expenses of the arbitrator and administrative fees and expenses of the arbitration shall be paid by the parties as provided by the AAA Rules governing the proceeding, or by specific ruling by the arbitrator or by agreement of the parties. The arbitrator shall have the authority to award in favor of the individual party seeking relief all remedies permitted by applicable substantive law, including, without limitation, compensatory, statutory and punitive damages (subject to constitutional limits that would apply in court), and attorneys’ fees and costs. In addition, the arbitrator may award declaratory or injunctive relief but only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted in that party’s individual Claim. Upon the timely request of either party, the arbitrator shall write a brief explanation of the basis of his or her award. Any court with jurisdiction may enter judgment upon the arbitrator’s award. If the arbitrator determines that any claim or defense is frivolous or wrongfully intended to oppress the other party, the arbitrator may award sanctions in the form of fees and expenses reasonably incurred by the other party (including arbitration administration fees, arbitrator’s fees, and attorney, expert and witness fees), to the extent such fees and expenses could be imposed under Rule 11 of the Federal Rules of Civil Procedure. NON-WAIVER: Even if all parties have opted to litigate a Claim in court, you or I may elect arbitration with respect to any Claim made by a new party or any Claim later asserted by a party in that or any related or unrelated lawsuit (including a Claim initially asserted on an individual basis but modified to be asserted on a class, representative or multi-party basis). Nothing in that litigation shall constitute a waiver of any
            
            rights under this Arbitration Agreement. For example, if you file a lawsuit against me in court to recover amounts due under the Loan Agreement, I have the right to request arbitration, but if I do not elect to request arbitration, you reserve and do not waive the right to request arbitration of any Claim (including any counterclaim) I later assert against you in that or any related or unrelated lawsuit. This Arbitration Agreement will apply to all Claims, even if the facts and circumstances giving rise to the Claims existed before the effective date of this Arbitration Agreement. Pursuant to a transaction involving interstate commerce and shall be governed by the FAA, and not by any state law concerning arbitration. If I have a question about the AAA, I can contact them as follows: American Arbitration Association,
            120 Broadway, Floor 21, New York, N.Y. 10271, 212-716- 5800, <a href="http://www.adr.org/" target="_blank">www.adr.org</a>.<br />
            <br />
            SURVIVAL, SEVERABILITY: This Arbitration Agreement shall survive full payment of the Loan, your sale or transfer of the Loan, any bankruptcy or insolvency, any forbearance or modification granted pursuant to this Agreement, any cancellation or request for cancellation of the Agreement or any disbursements under the Agreement. If any part or parts of this Arbitration Agreement are found to be invalid or unenforceable by a decision of a tribunal of competent jurisdiction, then such specific part or parts shall be of no force and effect and shall be severed, but the remainder of this Arbitration Agreement shall continue in full force and effect, except that: (A) If a determination is made in a proceeding involving you and me that the Class Action Waiver is invalid or unenforceable, only this sentence of this Arbitration Agreement will remain in force and the remainder of this Arbitration Agreement shall be null and void, provided that the determination concerning the Class Action Waiver shall be subject to appeal, and (B) If a Claim is brought seeking public injunctive relief and a court determines that the restrictions in this Arbitration Agreement prohibiting the arbitrator from awarding relief on behalf of third parties are unenforceable with respect to such Claim (and that determination becomes final after all appeals have been exhausted), the Claim for public injunctive relief will be determined in court and any individual   Claims seeking monetary relief will be arbitrated.   In such a case the parties will request that the court stay the Claim for public injunctive relief until the arbitration award pertaining to individual relief has been entered in court. In no event will a Claim for public injunctive relief be arbitrated.</div>
        </div>
        <div style="padding-bottom:20px">
          <div style="   padding:10px">DISCLOSURE NOTICES</div>
          <div  style="   padding:10px"><strong>Federal Notice:</strong> I understand that the following notice is required by federal law.<br />
            <br />
            <strong>ANY HOLDER OF THIS CONSUMER CREDIT CONTRACT IS SUBJECT TO ALL CLAIMS AND DEFENSES WHICH THE DEBTOR COULD ASSERT AGAINST THE SELLER OF GOODS OR SERVICES OBTAINED PURSUANT HERETO OR WITH THE PROCEEDS HEREOF. RECOVERY HEREUNDER BY THE DEBTOR SHALL NOT EXCEED AMOUNTS PAID BY THE DEBTOR HEREUNDER.</strong> <strong>For the purpose of the following notice, the words “you” and “your” mean the Borrower.</strong><br />
            Notice to Borrowers Regarding Loan Sales<br />
            I understand that you may sell, transfer or assign my Agreement or any associated interest without my consent. Should ownership or any interest in my Loan be transferred, I will be notified of the name, address, and telephone number of the new lender if the address to which I must make payments changes. Sale or transfer of my Loan does not affect my rights and responsibilities under this Agreement. I understand that acting in the capacity of a non-fiduciary agent to me, you will maintain a register to record the entitlement to payments of principal and interest on my Agreement and that beneficial ownership of such payments under my Agreement as reflected in the register will be conclusive notwithstanding notice to the contrary. You will notify me of a change in ownership reflected in the register if (1) this al ters the address to which I must make payments or (2) upon my reasonable written request. Sale, assignment, transfer of my Agreement or beneficial interest in payments of principal and interest on my Agreement does not affect my rights and responsibilities under this Agreement.<br />
            <br />
            CUSTOMER IDENTIFICATION POLICY NOTICE<br />
            <br />
            All Applicants: Important Federal Law Notice- Important information about procedures for opening a new account: To help the government fight the funding of terrorism and money laundering activities, federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account.<br />
            <br />
            What this means for you: When you open an account, we will ask for your name, address, date of birth and other information that will allow
            us to identify you. We may also ask to see your driver’s license or other identifying documents.<br />
            <br />
            <strong>State Notices: I understand that the following notices are or may be required by state laws and that these notices may not describe all of the rights that I have under state and federal laws. Unless otherwise indicated, each notice applies or may apply to Borrowers who live in the indicated states on the dates that they signed the Application and to Borrowers who are residents of that state. For purposes of the following notices, the word “you” refers to the Borrower not the Lender.</strong><br />
            <br />
            <strong>CALIFORNIA RESIDENTS:</strong> A married applicant may apply for a separate account.<br />
            <br />
            <strong> IOWA RESIDENTS: IMPORTANT: READ BEFORE SIGNING. THE TERMS OF THIS AGREEMENT SHOULD BE READ CAREFULLY BECAUSE ONLY THOSE TERMS IN WRITING ARE ENFORCEABLE. NO OTHER TERMS OR ORAL PROMISES NOT CONTAINED IN THIS WRITTEN CONTRACT MAY BE LEGALLY ENFORCED. YOU MAY CHANGE THE TERMS OF THIS AGREEMENT ONLY BY
            ANOTHER WRITTEN AGREEMENT. NOTICE TO CONSUMER: 1. Do not sign this paper before you read it. 2. You are entitled to a
            
            copy of this paper. 3. You may prepay the unpaid balance at any time without penalty and may be entitled to receive a refund of unearned charges in accordance with law.</strong><br />
            <br />
            <strong>MISSOURI RESIDENTS: Oral agreements or commitments to loan money, extend credit or to forbear from enforcing repayment of a debt including promises to extend or renew such debt are not enforceable. To protect you (borrower(s)) and us (creditor) from misunderstanding or disappointment, any agreements we reach covering such matters are contained in this writing, which is the complete and exclusive statement of the agreement between us, except as we may later agree in writing to modify it.</strong><br />
            <br />
            <strong>NEBRASKA RESIDENTS:</strong> (For purposes of the following notice, “you” refers to the Borrower not the Lender). Oral agreements or commitments to loan money, extend credit or to forbear from enforcing repayment of a debt including agreements promise to extend or renew such debt are not enforceable. To protect you (borrower(s)) and us (creditor) from misunderstanding or disappointment, any agreements we reach covering such matters are contained in this writing, which is the complete and exclusive statement of the agreement between us, except as we may later agree in writing to modify it.<br />
            <br />
            <strong>NEW JERSEY RESIDENTS: </strong>The section headings of this Note are a table of contents and not contract terms. Portions of this Note with references to actions taken to the extent of applicable law apply to acts or practices that New Jersey law permits or requires. In this Note, acts or practices (i) by you which are or may be permitted by “applicable law” are permitted by New Jersey law, and (ii) that may or will be taken by you unless prohibited by “applicable law” are permitted by New Jersey law.<br />
            <br />
            <strong>OHIO RESIDENTS:</strong> The Ohio laws against discrimination require that all creditors make credit equally available to all credit worthy customers, and that credit reporting agencies maintain separate credit histories on each individual upon request. The Ohio civil rights commission administers compliance with this law.<br />
            <br />
            <strong>TEXAS RESIDENTS:</strong> This written loan agreement represents the final agreement between the parties and may not be contradicted by evidence of prior, contemporaneous, or subsequent oral agreements of the parties. There are no unwritten oral agreements between the parties.<br />
            <br />
            <strong>UTAH RESIDENTS:</strong> This Note is the final expression of the agreement between me and you and it may not be contradicted by evidence of an alleged oral agreement.<br />
            <br />
            By my signature, I acknowledge that I have read and understand the information contained in the Application and Agreement, including the terms on the preceding pages and agree to be bound by those terms, including, but not limited to, the Promise to Pay in Section A of the Agreement. I certify that the information provided by me is true and accurate to the best of my knowledge and belief. The instructions to the Application are incorporated into and made a part hereof. By submitting my Application, I authorize the Lender, and the guarantor of this Loan, if any, to obtain credit or similar reports from one or more consumer credit reporting agencies in connection with my Application. If my Application is not accepted or upon my request, I will be informed of whether or not you obtained a consumer report and, if so, the name and address of the consumer reporting agency that furnished that report. If my Application is approved and a loan agreement entered into, I also authorize you to obtain additional credit reports and other information about me in connection with reviews, updates, extensions, renewals, modifications, collection activities of my Loan or any other legitimate purpose. I further authorize the Lender to verify with others any information contained in my Application to extend the Loan and to provide information about my transactions with the Lender to third parties (including consumer reporting agencies) for lawful purposes. My authorization to obtain consumer reports and other information about me from third parties is valid as long as I continue to owe any amounts under the Agreement. I agree that you may investigate any information that I supply in order to confirm my eligibility for this Loan Program.  I agree that the Agreement provides for the compounding of interest.<br />
            <br />
            The originating Lender to which my Application is directed is the Bank, in Banktown. I authorize the Lender to consider my Application as an application for the lowest cost loan for which I am qualified under this program. <br />
            <br />
            NOTICE TO CONSUMER: In the following Notice, the word “you” refers to the Borrower a. DO NOT SIGN THIS BEFORE YOU READ THE WRITING ON THE PRECEDING PAGES, EVEN IF OTHERWISE ADVISED. DO NOT SIGN THIS IF IT CONTAINS ANY BLANK SPACES. YOU ARE ENTITLED TO AN EXACT COPY OF ANY AGREEMENT YOU SIGN. YOU HAVE THE RIGHT AT ANY TIME TO PAY IN ADVANCE THE UNPAID BALANCE UNDER THIS AGREEMENT WITHOUT PENALTY AND YOU MAY BE ENTITLED TO A PARTIAL REFUND OF THE FINANCE CHARGE IN ACCORDANCE WITH LAW.<br />
            <br />
            <strong>I UNDERSTAND THAT THIS IS A LOAN THAT I MUST REPAY.</strong><br />
            <br />
            CAUTION--IT IS IMPORTANT THAT YOU THOROUGHLY READ THE CONTRACT BEFORE YOU SIGN IT.<br />
            <br />
            Borrower Signature <img src="${this.signature}" height="60" width="125">  date signed (${this.date}) </div>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      </body>
      </html>`;
      return htmlData;
    }
    
  
  }
