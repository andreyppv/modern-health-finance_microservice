import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DatePipe, Location } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { AccountNumberValidator } from 'src/app/_service/custom.validator';
import { FileValidators } from 'ngx-file-drag-drop';
import {
  PayamentSchedules,
  FinanceInatance,
  CommonDataInatance,
} from '../../_service/comman.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { readyMade, environment } from '../../../environments/environment';
import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular';
@Component({
  selector: 'app-loan-stages-details',
  templateUrl: './loan-stages-details.component.html',
  styleUrls: ['./loan-stages-details.component.scss'],
})
export class LoanStagesDetailsComponent implements OnInit {
  data: any = {
    answers: [],
    CoApplicant: [],
    document: [],
    from_details: [],
    userDocument: [],
    paymentScheduleDetails: [],
  };
  confirmdate: any;
  mindate: Date;
  userConsentDocuments: any = [];
  cm = {};
  res_comments: any = [];
  payment: any = [];
  empdata: any = [];
  stateList = [];
  lastpaydate: any = '';
  nextpaydate: any = '';
  secondpaydate: any = '';
  createddate: any = '';
  payfrequency: any = '';
  payfrequency1: any = '';
  modalRef: BsModalRef;
  message: any = [];
  monthArr = [12, 24, 36, 48, 60];
  manualBankAddFields = {};
  screenlogs: any = [];
  login_user_id: any;
  htmlDocview: any = null;
  todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  transUnionCreditReport: any = {
    result: {
      status: 'Declined',
      rulesCount: 12,
      passRules: [
        'R1: Months of Credit History (Month) <  640',
        'R2: Number of active trade lines  >  1',
        'R5: BK in last 24 mos >  4',
        'R6: Foreclosure in last 24 mos >  0',
        'R7: public records in last 24 months >  5',
        'R8: #Of trades with #60+DPD in past 24 months >  500',
        'R9: #Of trades with #60+DPD in past 6 months  > 2',
        'R10: Utilization of Revolving trades > 0',
        'R12: ISA Shares income exeeds percent  >  0',
      ],
      failRules: [
        'R3: Number of revolving trade lines <= 4',
        'R4: Inquiries in last 6 mos <=  4',
        'R11: Minimum Credit Score > 0',
      ],
      bankPassRules: [
        'BTR1: Average income in 6 months  > 0',
        'BTR2: NSF transactions in a month  > 0',
        'BTR3: NSF transactions in 3 months  > 0',
        'BTR4: Average balance in 6 months  > 0',
        'BTR5: Current balance  > 0',
        'BTR6: Balance from all depository bank accounts  > 0',
        'BTR7: Average balance from depository accounts in 3 months  > 0',
        'BTR8: Total income in 6 months  > 0',
        'BTR9: Days since oldest transaction  > 0',
        'BTR10: Average most recent available balance  > 0',
        'BTR11: Ratio of time in days from primary checking account having no activity  > 0',
        'BTR12: Total spending related transactions in the past 30 days  > 0',
        'BTR13: Total payment related transaction in past 3 months  > 0',
        'BTR14: Total ATM fee related transactions in the past 3 months   > 0',
      ],
      bankFailRules: [],
      offers: [
        {
          apr: 29.9,
          finalRequestedLoanAmount: 1500,
          financedAmount: 1500,
          fullNumberAmount: 0,
          interestFeeAmount: 0,
          interestRate: 0,
          loanamount: 1500,
          loanGrade: '1100',
          offerType: '3900',
          offerValue: '3900',
          maxCreditScore: 639,
          minCreditSCore: 600,
          maxDTI: 40,
          minDTI: 30,
          maximumAmount: 120000,
          minimumAmount: 0,
          totalLoanAmount: 0,
        },
      ],
      terms: [
        {
          termDuration: '10',
          termDescription: 'Term 10',
          gradeDescription: '1100',
          monthlypayment: 0,
          maxMonthlyPayment: 0,
        },
        {
          termDuration: '15',
          termDescription: 'Term 15',
          gradeDescription: '1100',
          monthlypayment: 0,
          maxMonthlyPayment: 0,
        },
        {
          termDuration: '18',
          termDescription: 'Term 18',
          gradeDescription: '1100',
          monthlypayment: 0,
          maxMonthlyPayment: 0,
        },
        {
          termDuration: '24',
          termDescription: 'Term 24',
          gradeDescription: '1100',
          monthlypayment: 0,
          maxMonthlyPayment: 0,
        },
      ],
      requestedloanamount: 1500,
      message: 'Offers retrieved.',
    },
    id: 5,
    exception: null,
    status: 5,
    isCanceled: false,
    isCompleted: true,
    isCompletedSuccessfully: true,
    creationOptions: 0,
    asyncState: null,
    isFaulted: false,
  };

  editName = false;
  editStreetAddress = false;
  editCity = false;
  editZipCode = false;
  editNameFields = {};
  editStreetFields = {};
  editCityFields = {};
  editZipCodeFields = {};
  bankAddForm: FormGroup;
  fSubmitted = false;
  public creditReportData: any;
  eligibleOfferDetails: any = [];
  tradeDebt: any = null;
  editEmpdata = false;

  div1: boolean = true;
  div2: boolean = false;
  div3: boolean = false;
  div4: boolean = false;
  div5: boolean = false;
  div6: boolean = false;
  div7: boolean = false;
  div8: boolean = false;
  div9: boolean = false;
  isActive1: any = '';
  isActive2: any = '';
  isActive3: any = '';
  isActive4: any = '';
  isActive5: any = '';
  isActive6: any = '';
  isActive7: any = '';
  isActive8: any = '';
  isActive9: any = '';
  titleval: any = '';
  bdiv1: boolean = true;
  bdiv2: boolean = false;
  bdiv3: boolean = false;
  Bactive1: any = '';
  Bactive2: any = '';
  Bactive3: any = '';
  pdiv1: boolean = false;
  cdiv1: boolean = true;
  cdiv2: boolean = false;
  cactive1: any = '';
  cactive2: any = '';
  iterableval: any = '';

  flinksAttr: any = {
    HttpStatusCode: 200,
    Card: {
      Id: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
      account_age_days: 364,
      employer_name: 'United Airlines',
      average_monthly_employer_income_complex: 500,
      employer_income_trend_simple: 'CONSISTENT',
      average_monthly_non_employer_income_complex: 0,
      average_monthly_government_income_complex: 0,
      total_deposits_trend_simple: 'CONSISTENT',
      sum_employer_income_current_month: 500,
      sum_employer_income_previous_month: 500,
      sum_employer_income_2_months_ago: 500,
      sum_employer_income_3_months_ago: 500,
      sum_employer_income_4_months_ago: 500,
      sum_employer_income_5_months_ago: 500,
      sum_employer_income_6_months_ago: 500,
      sum_employer_income_7_months_ago: 500,
      sum_employer_income_8_months_ago: 500,
      sum_employer_income_9_months_ago: 500,
      sum_employer_income_10_months_ago: 500,
      sum_employer_income_11_months_ago: 500,
      sum_employer_income_12_months_ago: 0,
      count_employer_income_current_month: 1,
      count_employer_income_previous_month: 1,
      count_employer_income_2_months_ago: 1,
      count_employer_income_3_months_ago: 1,
      count_employer_income_4_months_ago: 1,
      count_employer_income_5_months_ago: 1,
      count_employer_income_6_months_ago: 1,
      count_employer_income_7_months_ago: 1,
      count_employer_income_8_months_ago: 1,
      count_employer_income_9_months_ago: 1,
      count_employer_income_10_months_ago: 1,
      count_employer_income_11_months_ago: 1,
      count_employer_income_12_months_ago: 0,
      sum_government_income_90_days: 0,
      sum_government_income_current_month: 0,
      sum_government_income_previous_month: 0,
      sum_government_income_2_months_ago: 0,
      sum_government_income_3_months_ago: 0,
      sum_government_income_4_months_ago: 0,
      sum_government_income_5_months_ago: 0,
      sum_government_income_6_months_ago: 0,
      sum_government_income_7_months_ago: 0,
      sum_government_income_8_months_ago: 0,
      sum_government_income_9_months_ago: 0,
      sum_government_income_10_months_ago: 0,
      sum_government_income_11_months_ago: 0,
      sum_government_income_12_months_ago: 0,
      count_government_income_current_month: 0,
      count_government_income_previous_month: 0,
      count_government_income_2_months_ago: 0,
      count_government_income_3_months_ago: 0,
      count_government_income_4_months_ago: 0,
      count_government_income_5_months_ago: 0,
      count_government_income_6_months_ago: 0,
      count_government_income_7_months_ago: 0,
      count_government_income_8_months_ago: 0,
      count_government_income_9_months_ago: 0,
      count_government_income_10_months_ago: 0,
      count_government_income_11_months_ago: 0,
      count_government_income_12_months_ago: 0,
      sum_employment_insurance_income_90_days: 0,
      sum_social_assistance_income_90_days: 0,
      sum_wsib_income_90_days: 0,
      sum_pension_income_90_days: 0,
      sum_child_support_income_government_90_days: 0,
      sum_other_income_90_days: 0,
      sum_total_credits_current_month: 500,
      sum_total_credits_previous_month: 504.22,
      sum_total_credits_2_months_ago: 508.44,
      sum_total_credits_3_months_ago: 504.22,
      sum_total_credits_4_months_ago: 504.22,
      sum_total_credits_5_months_ago: 504.22,
      sum_total_credits_6_months_ago: 504.22,
      sum_total_credits_7_months_ago: 504.22,
      sum_total_credits_8_months_ago: 504.22,
      sum_total_credits_9_months_ago: 504.22,
      sum_total_credits_10_months_ago: 504.22,
      sum_total_credits_11_months_ago: 504.22,
      sum_total_credits_12_months_ago: 0,
      balance_min: -10330.88,
      count_days_negative_balance_90_days: 2,
      average_monthly_free_cash_flow: -10569.99,
      balance_trend_simple: 'DECREASING',
      average_monthly_loan_payments_complex: 0,
      average_monthly_auto_loan_payments_complex: 0,
      average_monthly_mortgage_payments_complex: 0,
      average_monthly_micro_loan_payments_complex: 0,
      average_monthly_student_loan_payments_complex: 0,
      average_monthly_other_loan_payments_complex: 0,
      average_monthly_utility_payments_complex: 0,
      average_monthly_telecom_payments_complex: 0,
      count_nsf_90_days: 0,
      count_stop_payment_90_days: 0,
      micro_lender_name: 'NONE_DETECTED',
      average_monthly_debit: 11068.67,
      count_active_days: 122,
      overall_activity_trend_simple: 'CONSISTENT',
      debit_activity_trend_simple: 'CONSISTENT',
      credit_activity_trend_simple: 'CONSISTENT',
      has_employer_income: 'YES',
      average_monthly_recurring_payments_complex: 0,
      sum_loan_payments: 0,
      sum_employer_income: 6000,
      AttributesDetail: [
        {
          Attribute: 'sum_total_credits_current_month',
          Transactions: [
            {
              transactionid: '7ccbca58-d624-40f5-ad80-21cf111c34cb',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2022/02/02',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 65756.6,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_previous_month',
          Transactions: [
            {
              transactionid: 'd9682a65-b6be-4491-9a6b-51ff5ccb67cb',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2022/01/30',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69831.7,
            },
            {
              transactionid: '0b86b41e-b91d-4c0a-92d2-745285efd29a',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2022/01/03',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66139.14,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_2_months_ago',
          Transactions: [
            {
              transactionid: 'f30bc399-49d3-4c75-824c-93a2b784a945',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/12/31',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69810.92,
            },
            {
              transactionid: '5f4e8496-31de-4e3a-af5a-b44d93434e5a',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/12/04',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66521.68,
            },
            {
              transactionid: '2bdc5cf6-8850-4cff-9e55-788cd5f0e2f6',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/12/01',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69790.14,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_3_months_ago',
          Transactions: [
            {
              transactionid: '8f158388-786b-4ba7-b764-d96e12e9be8f',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/11/04',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66904.22,
            },
            {
              transactionid: 'e70ab95a-62be-40c1-96c8-aa03162fb444',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/11/01',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69769.36,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_4_months_ago',
          Transactions: [
            {
              transactionid: '28c5468b-9f5e-4c1a-9313-2fc9ad57a6a4',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/10/05',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 67286.76,
            },
            {
              transactionid: 'd1f0c7ac-c0a9-4f91-8f7a-1b9df54f7116',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/10/02',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69748.58,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_5_months_ago',
          Transactions: [
            {
              transactionid: '7be7b4a3-e1e0-476d-86b7-7c91fa4d7e21',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/09/05',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 67669.3,
            },
            {
              transactionid: '374eaa00-1329-4510-b222-d68b2271e85d',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/09/02',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69727.8,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_6_months_ago',
          Transactions: [
            {
              transactionid: '49ea65fc-efe9-4f07-9f5f-184a7bfad66d',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/08/06',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68051.84,
            },
            {
              transactionid: '663780e9-78ce-488a-9b8a-abefb3836c5b',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/08/03',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69707.02,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_7_months_ago',
          Transactions: [
            {
              transactionid: 'cb3fe05d-e4d9-4244-b8cf-07ab0bc74af7',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/07/07',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68434.38,
            },
            {
              transactionid: '48fc1e26-17d5-476c-aa2e-96beabd1ac14',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/07/04',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69686.24,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_8_months_ago',
          Transactions: [
            {
              transactionid: '238fe417-1d5d-41ae-8d54-4393cc03d413',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/06/07',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68816.92,
            },
            {
              transactionid: '258f70d3-6908-4122-afee-9f4113d239bd',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/06/04',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69665.46,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_9_months_ago',
          Transactions: [
            {
              transactionid: 'a340a06a-dffc-404d-bcf7-907cdc52f45b',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/05/08',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69199.46,
            },
            {
              transactionid: '1efd4137-eb16-4150-aa16-306b90059a7d',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/05/05',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69644.68,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_10_months_ago',
          Transactions: [
            {
              transactionid: '73887dd4-1ffd-456e-b888-796ea901a2e0',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/04/08',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69582,
            },
            {
              transactionid: '92acdfe8-c1d4-448e-a9f3-a45b915a98c5',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/04/05',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69623.9,
            },
          ],
        },
        {
          Attribute: 'sum_total_credits_11_months_ago',
          Transactions: [
            {
              transactionid: 'bdf7428c-37ff-4258-9a18-773192809abb',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/03/09',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69964.54,
            },
            {
              transactionid: '34259ad7-7187-496f-8156-8bfacb0c4f4e',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/03/06',
              Description: 'INTRST PYMNT',
              Debit: null,
              Credit: 4.22,
              Balance: 69603.12,
            },
          ],
        },
        {
          Attribute: 'sum_employer_income',
          Transactions: [
            {
              transactionid: '7ccbca58-d624-40f5-ad80-21cf111c34cb',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2022/02/02',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 65756.6,
            },
            {
              transactionid: '0b86b41e-b91d-4c0a-92d2-745285efd29a',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2022/01/03',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66139.14,
            },
            {
              transactionid: '5f4e8496-31de-4e3a-af5a-b44d93434e5a',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/12/04',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66521.68,
            },
            {
              transactionid: '8f158388-786b-4ba7-b764-d96e12e9be8f',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/11/04',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 66904.22,
            },
            {
              transactionid: '28c5468b-9f5e-4c1a-9313-2fc9ad57a6a4',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/10/05',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 67286.76,
            },
            {
              transactionid: '7be7b4a3-e1e0-476d-86b7-7c91fa4d7e21',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/09/05',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 67669.3,
            },
            {
              transactionid: '49ea65fc-efe9-4f07-9f5f-184a7bfad66d',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/08/06',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68051.84,
            },
            {
              transactionid: 'cb3fe05d-e4d9-4244-b8cf-07ab0bc74af7',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/07/07',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68434.38,
            },
            {
              transactionid: '238fe417-1d5d-41ae-8d54-4393cc03d413',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/06/07',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 68816.92,
            },
            {
              transactionid: 'a340a06a-dffc-404d-bcf7-907cdc52f45b',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/05/08',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69199.46,
            },
            {
              transactionid: '73887dd4-1ffd-456e-b888-796ea901a2e0',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/04/08',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69582,
            },
            {
              transactionid: 'bdf7428c-37ff-4258-9a18-773192809abb',
              AccountId: '0e3180b8-6339-42d0-24d1-08d9f315cb5b',
              Date: '2021/03/09',
              Description: 'United Airlines',
              Debit: null,
              Credit: 500,
              Balance: 69964.54,
            },
          ],
        },
      ],
    },
    RequestId: '1e01c5cc-7fd5-479e-91d2-08f14c824639',
  };
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  tabs: any = {
    'User Information': false,
    'Credit Report': false,
    'Payment Schedule': false,
    'Bank Accounts': false,
    'Document Center': false,
    Comments: false,
    Log: false,
  };
  documentsTypes = CommonDataInatance.documentsTypes(false);
  formControls: any;
  public id: string;
  public stage: string;
  public pageTitle = 'Performing Contracts Details';
  public loanStage = CommonDataInatance.stageList;
  viewApp: boolean = false;
  bankaccounts: any = [];
  historybalance: any = [];
  historyacno: any = [];
  ownerInformation: any = [];
  apForm: FormGroup;
  apForms: FormGroup;
  apibtn: boolean = false;
  durationMonths = environment.offersTerms;
  employInfo: FormGroup;
  accountholderdet: any = [];

  loanid: any = location.href.split('/')[location.href.split('/').length - 1];

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  payamentSchedules = new PayamentSchedules();
  public paymentfrequency = new FormControl('M');
  creditDataRes: any = null;
  creditData: any = null;
  public offer_form: FormGroup;
  public offer_inputIndex: number = -1;
  public offer_saveClicked: boolean = false;
  public activehistindex: number = 0;
  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public sanitizer: DomSanitizer,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.mindate = new Date();
    console.log('MinDate=>', this.mindate);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let pages = sessionStorage.getItem('pages');
    let tabs = sessionStorage.getItem('tabs');
    if (pages) {
      pages = JSON.parse(pages);
      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Pending Application') {
          if (tabs) {
            tabs = JSON.parse(tabs);
            console.log(tabs[pages[i]['id']]);
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']] = true;
            }
            i = pages.length + 1;
          }
        }
      }
    }
    this.div1Function('');
    this.getUserConsentDocuments();
    this.stateList = CommonDataInatance.stateList();
    this.apForms = this.formBuilder.group({
      startdate: ['', [Validators.required]],
      duedate: ['', [Validators.required]],
    });

    this.employInfo = this.formBuilder.group({
      employer: [''],
      employerphone: [''],
      streetaddress: [''],
      city: [''],
      state: [''],
      zipcode: [''],
      annualincome: [''],
      payfrequency: [''],
      payment_duedate: [''],
      createddate: [''],
    });

    this.bankAddForm = this.formBuilder.group(
      {
        bankname: ['', Validators.required],
        holdername: ['', Validators.required],
        routingnumber: ['', [Validators.required, Validators.min(10000)]],
        accountnumber: ['', [Validators.required, Validators.min(1000000000)]],
        confmAccountNumber: ['', Validators.required],
      },
      { validator: AccountNumberValidator }
    );
    this.login_user_id = JSON.parse(sessionStorage.getItem('resuser')).id;
    this.id = this.route.snapshot.paramMap.get('id');
    this.stage = this.route.snapshot.paramMap.get('stage');
    this.pageTitle = this.loanStage[this.stage] + ' Applications Details';
    console.log(this.pageTitle);
    console.log(this.stage);

    //build form
    this.apForm = this.formBuilder.group({
      LoanAmount: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      APR: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      Duration: ['12', [Validators.required]],
      PaymentAmount: [{ value: 0, disabled: true }],
      OriginationFee: [0, [Validators.pattern(readyMade.pattern.decimal)]],
      RealAPR: [0],
    });
    this.get();
    // this.getlogs();
    // this.creditReport();
    // this.offer_init();
    // this.empdetails();

    this.formControls = {
      docFile: new FormControl(
        [],
        [
          FileValidators.required,
          FileValidators.fileExtension(['png', 'jpeg', 'pdf', 'jpg']),
        ]
      ),
      type: new FormControl('', [FileValidators.required]),
    };
    this.getbankaccounts(this.id);
    this.gethistoricalbankacc(this.id);
    this.getBankaccuserinfo(this.id);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.bankAddForm.controls;
  }
  get apiFormvalidation() {
    return this.apForms.controls;
  }

  goback() {
    this._location.back();
  }
  creditReport() {
    this.service
      .authget('loan/creditreport/' + this.id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            if (res['data'].length) {
              console.log(JSON.parse(res['data'][0]['report']));
              this.creditDataRes = JSON.parse(res['data'][0]['report']);
              this.creditData = this.creditDataRes.transUnion;
              this.tradeDebt = res['tradeDebt'];
              this.transUnionCreditReport =
                this.creditDataRes.loanOffersResponse;
              console.log(this.creditDataRes.loanOffersResponse);
              console.log('mohamed mohideen');
            }
          } else {
            this.message = res['message'];
            this.service.showError(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  pay() {
    // let date = new Date(this.data['from_details'][0]['createdat']);
    // let lastpaymentdate = this.data['paymentScheduleDetails'].length;

    // this.payment = [];
    // this.payment.push({
    //   createdat: this.dt(date),
    //   loan_advance: this.data['from_details'][0]['loanamount'],
    //   payOffAmount: this.data['from_details'][0]['loanamount'],
    //   apr: this.data['from_details'][0]['apr'],
    //   loantermcount: this.data['from_details'][0]['loanterm'],
    //   maturityDate: this.dt(
    //     new Date(
    //       this.data['paymentScheduleDetails'][lastpaymentdate - 1][
    //         'scheduledate'
    //       ]
    //     )
    //     // new Date(
    //     //   new Date(this.data['from_details'][0]['createdat']).setMonth(
    //     //     new Date(this.data['from_details'][0]['createdat']).getMonth() + 12
    //     //   )
    //     // )
    //   ),
    //   nextpaymentschedule: this.dt(
    //     new Date(this.data['paymentScheduleDetails'][1]['scheduledate'])
    //     // new Date(
    //     //   new Date(
    //     //     new Date(this.data['from_details'][0]['createdat']).setDate(
    //     //       new Date(this.data['from_details'][0]['createdat']).getDate() + parseInt(this.data['from_details'][0]['payment_duedate'])
    //     //     )
    //     //   ).setMonth(
    //     //     new Date(this.data['from_details'][0]['createdat']).getMonth() + 1
    //     //   )
    //     // )
    //     // new Date(
    //     //   new Date(this.data['from_details'][0]['createdat']).setMonth(
    //     //     new Date(this.data['from_details'][0]['createdat']).getMonth() + 1
    //     //   )
    //     // )
    //   ),
   // });

    // var principal = Number(this.data['from_details'][0]['loanamount']);
    // var interest = Number(this.data['from_details'][0]['apr']) / 100 / 12;
    // var payments = Number(this.data['from_details'][0]['loanterm'])
    // var x = Math.pow(1 + interest, payments);
    // var monthly:any = (principal*x*interest)/(x-1);
    // this.payment.push([])
    // if (!isNaN(monthly) &&
    //     (monthly != Number.POSITIVE_INFINITY) &&
    //     (monthly != Number.NEGATIVE_INFINITY)) {
    //       monthly = this.round(monthly);
    //
    //       }

    //     }
  }

  round(x) {
    return Math.round(x * 100) / 100;
  }

  dt(today) {
    var dd: any = today.getDate();

    var mm: any = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    return mm + '-' + dd + '-' + yyyy;
  }

  getcomments() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('pending/getcomments/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.res_comments = res['data'];
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  get() {
    // this.service.authget('pending/'+id+"/"+this.login_user_id,'admin')
    this.service
      .authget('loanstage/' + this.id + '/' + this.stage, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
           console.log('res---->', res);
          if (res['statusCode'] == 200) {
            this.data = res['data'];
            this.viewApp = true;
            // console.log(this.data.from_details[0].procedure_startdate.toISOString());

            // this.apForms
            //   .get('duedate')
            //   .setValue(this.data.from_details[0].payment_duedate);
            // this.apForms
            //   .get('startdate')
            //   .setValue(
            //     this.datePipe.transform(
            //       this.data.from_details[0].procedure_startdate,
            //       'yyyy-MM-dd'
            //     )
            //   );
            // if (this.data['paymentScheduleDetails'].length > 0) this.pay();
            // this.getcomments();
            // this.editNameFields['firstname'] =
            //   this.data.from_details[0]['firstname'];
            // this.editNameFields['lastname'] =
            //   this.data.from_details[0]['lastname'];
            // this.editStreetFields['streetaddress'] =
            //   this.data.from_details[0]['streetaddress'];
            // this.editCityFields['city'] = this.data.from_details[0]['city'];
            // this.editZipCodeFields['zipcode'] =
            //   this.data.from_details[0]['zipcode'];
            // this.viewApp = true;
           // this.afterResponse();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
            //this.router.navigate(['admin/funding-contracts']);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
          //this.router.navigate(['admin/pendings']);
        }
      );
  }

  getUserConsentDocuments() {
    this.service
      .authget('loan/Document/' + this.loanid, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data.document = res['data'];
            this.userConsentDocuments = res['data'];
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  findPaymentAmount(): number {
    var monthly: any;
    let loanamount = this.apForm.get('LoanAmount').value,
      arr = this.apForm.get('APR').value,
      duration = this.apForm.get('Duration').value;
    monthly = FinanceInatance.findPaymentAmount(
      Number(loanamount),
      Number(arr),
      Number(duration)
    );
    this.apForm.get('PaymentAmount').setValue(monthly);
    return monthly;
  }
  findPaymentAmountWithOrigination() {
    let loanamount = this.apForm.get('LoanAmount').value,
      originationFee = this.apForm.get('OriginationFee').value,
      apr = this.apForm.get('APR').value,
      duration = this.apForm.get('Duration').value;
    let result = FinanceInatance.findPaymentAmountWithOrigination(
      Number(loanamount),
      Number(apr),
      Number(duration),
      Number(originationFee)
    );
    this.apForm.get('PaymentAmount').setValue(result.monthlyAmount);
    this.apForm.get('RealAPR').setValue(result.realAPR);
    //console.log(result);
  }
  afterResponse(): void {
    //data convertion
    this.data.from_details[0].birthday = new Date(
      this.data.from_details[0].birthday
    );
    this.data.from_details[0].createdat = new Date(
      this.data.from_details[0].createdat
    );
    this.data.from_details[0].updatedat = new Date(
      this.data.from_details[0].updatedat
    );
    //set input value
    this.apForm
      .get('LoanAmount')
      .setValue(this.data.from_details[0].loanamount);
    this.apForm.get('APR').setValue(this.data.from_details[0].apr);
    this.apForm.get('Duration').setValue(this.data.from_details[0].loanterm);
    this.apForm
      .get('OriginationFee')
      .setValue(this.data.from_details[0].orginationfees);
    //trigger
    //find payment amount
    this.findPaymentAmountWithOrigination();
    //paymentschedules
    let obj: any = {};
    obj.amount = this.data.from_details[0].loanamount;
    obj.apr = this.data.from_details[0].apr;
    obj.term = this.data.from_details[0].loanterm;
    this.paymentfrequency.setValue(this.data.from_details[0].payfrequency);
    this.payamentSchedules.loanInfo = obj;
    this.payamentSchedules.paymentfrequency = this.paymentfrequency;
    this.payamentSchedules.createEvents(this.data.paymentScheduleDetails);
  }
  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      console.log(this.apForm.value);
      //data
      let data = this.apForm.value,
        sendData;
      sendData = {
        loanamount: Number(data.LoanAmount),
        duration: +data.Duration,
        apr: +data.APR,
        orginationFee: +data.OriginationFee,
      };
      this.service
        .authpatch(
          'loanstage/editcustomerloanamountdetails/' + this.id,
          'admin',
          sendData
        )
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.get();
              //this.router.navigate(['admin/dashboard']);
              this.message = ['Loan details updated'];
              this.modalRef = this.modalService.show(this.messagebox);
            } else {
              this.message = [res['message']];
              this.modalRef = this.modalService.show(this.messagebox);
            }
          },
          (err) => {
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          }
        );
    }
  }
  inviteUser(): void {
    this.service
      .authget('mailcontrollers/' + this.id + '/Invite', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            console.log(res);
            this.message = [res['data']];
            this.modalRef = this.modalService.show(this.messagebox);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  inviteTest(): void {
    var userData = JSON.parse(sessionStorage.getItem('resuser'));
    this.service
      .authget(
        'mailcontrollers/' + this.id + '/Invite/' + userData.email,
        'admin'
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.message = [res['data']];
            console.log(res);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  invite() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget(
        'pending/invite/' + this.data['from_details'][0]['user_id'],
        'admin'
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.message = ['Invite Link Sent Successfully'];
            this.modalRef = this.modalService.show(this.messagebox);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  viewdoc(filename: any) {
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    this.htmlDocview = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.adminapiurl + 'files/download/' + filename
    );
  }

  view(filename: any) {
    let loanid = this.route.snapshot.paramMap.get('id');
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    this.htmlDocview = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.adminapiurl + 'files/download/' + loanid + '/' + filename
    );
  }
  /*view(filename: any) {
    // console.log('Hello');
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    this.htmlDocview = this.sanitizer.bypassSecurityTrustResourceUrl(
      environment.adminapiurl + 'files/download/' + filename
    );
    // window.open(
    //   environment.adminapiurl + 'files/download/' + filename,
    //   '_blank'
    // );
  }*/

  close(): void {
    this.modalRef.hide();
  }

  Deny() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authput('loanstage/setdenied/' + id, 'admin', '')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/loan-stages/denied/' + id]);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  Archive() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authput('loanstage/makearchive/' + id, 'admin', '')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/loan-stages/archived/' + id]);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  Approve(template: TemplateRef<any>) {
    //let id = this.route.snapshot.paramMap.get('id');
    this.modalRef = this.modalService.show(template);
  }
  updateProcedureDate(template: TemplateRef<any>) {
    //let id = this.route.snapshot.paramMap.get('id');
    this.modalRef = this.modalService.show(template);
  }
  confirmProcedure(template: TemplateRef<any>) {
    //let id = this.route.snapshot.paramMap.get('id');
    //this.get();
    this.modalRef = this.modalService.show(template);
  }
  confirmdateStatus() {
    this.service
      .authput(
        'loanstage/setfundingcontract/' + this.id,
        'admin',
        this.editNameFields
      )
      .pipe(first())
      .subscribe(
        (res) => {
          this.router.navigate([
            'admin/loan-stages/fundingcontract/' + this.id,
          ]);
          this.modalRef.hide();
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  modelopen(modelTemp: TemplateRef<any>) {
    this.modalRef = this.modalService.show(modelTemp);
  }

  manualBankAdd() {
    this.fSubmitted = true;
    if (this.bankAddForm.invalid) {
      return;
    }

    this.bankAddForm.value.user_id = this.data.from_details[0].user_id;
    console.log('bankAddForm.value', this.bankAddForm.value);

    this.service
      .authpost('pending/manualbankadd', 'admin', this.bankAddForm.value)
      .pipe(first())
      .subscribe(
        (res) => {
          console.log('res', res);
          if (res['statusCode'] == 200) {
            console.log('data', res['data']);
            this.bankAddFormClose();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  bankAddFormClose() {
    console.log('bankAddFormClose call');

    this.modalRef.hide();
    this.fSubmitted = false;
    this.bankAddForm.reset();
  }

  addcomments(msgbox: TemplateRef<any>) {
    this.cm['loan_id'] = this.route.snapshot.paramMap.get('id');
    this.cm['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id'];
    this.service
      .authpost('pending/addcomments', 'admin', this.cm)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.close();
            this.message = ['Comments Added'];
            this.modalRef = this.modalService.show(msgbox);
            this.getcomments();
            this.getlogs();
            this.cm['subject'] = '';
            this.cm['comments'] = '';
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(msgbox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  getlogs() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('approved/getlogs/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.screenlogs = res['data'];
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  editUserName() {
    this.service
      .authput(
        'customer/editusername/' + this.data.from_details[0].user_id,
        'admin',
        this.editNameFields
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['firstname'] =
              this.editNameFields['firstname'];
            this.data.from_details[0]['lastname'] =
              this.editNameFields['lastname'];
            this.editName = false;
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  editUserStreetAddress() {
    this.service
      .authput(
        'customer/editstreetaddress/' + this.data[0].user_id,
        'admin',
        this.editStreetFields
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['streetaddress'] =
              this.editStreetFields['streetaddress'];
            this.editStreetAddress = false;
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  editUserCity() {
    this.service
      .authput(
        'customer/editusercity/' + this.data.from_details[0].user_id,
        'admin',
        this.editCityFields
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['city'] = this.editCityFields['city'];
            this.editCity = false;
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  editUserZipCode() {
    this.service
      .authput(
        'customer/edituserzipcode/' + this.data.from_details[0].user_id,
        'admin',
        this.editZipCodeFields
      )
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['zipcode'] =
              this.editZipCodeFields['zipcode'];
            this.editZipCode = false;
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  uploadDoc(): void {
    if (this.formControls.docFile.valid && this.formControls.type.valid) {
      this.cm['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id'];
      let formData = new FormData();
      formData.append('type', this.formControls.type.value);
      formData.append('loan_id', this.id);
      formData.append('files', this.formControls.docFile.value[0]);
      formData.append('user_id', this.cm['user_id']);
      console.log(formData, 'Formdata');
      this.service
        .files('uploadfiles/uploads/', 'admin', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              //value update
              this.data.userDocument.push({
                type: this.formControls.type.value,
                orginalfilename: this.formControls.docFile.value[0].name,
                filename: res['data']['key'],
              });

              this.formControls.docFile.setValue([]);
              this.formControls.type.setValue('');
              this.modalRef.hide();
            } else {
              console.log(res['statusCode'], res);
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    } else {
      //show error
      console.log('error');
      console.log(
        this.formControls.docFile.value,
        this.formControls.docFile.valid,
        'here',
        this.formControls.docFile.errors
      );
    }
  }
  getbankaccounts(id) {
    this.service.authget('plaid/accounts/' + id, 'admin').subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.bankaccounts = res['data'];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  sendbanklogin() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('plaid/requestBank/' + id, 'admin').subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.message = ['Mail Successfully Sent'];
          this.modalRef = this.modalService.show(this.messagebox);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  rePullBankAccounts() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('plaid/accountsRepull/' + id, 'admin').subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.bankaccounts = res['data'];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  creditReportPull() {
    this.service.authget('creditpull/creditpull/' + this.id, 'admin').subscribe(
      (res) => {
        console.log(res, 'pull');
        if (res['statusCode'] == 200) {
          this.creditReportData = {
            file: 'data:application/pdf;base64,' + res['data'],
          };
        } else {
          alert(res['error']);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  safeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  funded() {
    let sendData = { stage: 'performingcontract' };
    this.service.authpost('loanstage/' + this.id, 'admin', sendData).subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.router.navigate([
            'admin/loan-stages/performingcontract/' + this.id,
          ]);
          this.message = ['Successfully moved into performing contract'];
          this.modalRef = this.modalService.show(this.messagebox);
        } else {
          this.message = res['message'];
          this.modalRef = this.modalService.show(this.messagebox);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  paymentAccordinChange(isOpen: boolean) {
    //console.log(isOpen);
    if (isOpen) {
      setTimeout(
        function () {
          this.payamentSchedules.calendarApi = this.calendarComponent.getApi();
          this.payamentSchedules.calendarApi.render();
        }.bind(this),
        500
      );
    }
  }
  saveReschedules() {
    let sendData = {
      loan_id: this.id,
      paymentFrequency: this.paymentfrequency.value,
      date: this.payamentSchedules.paymentStartDate.toISOString(),
    };
    this.service
      .authpatch('loanstage/PaymentReschedule/', 'admin', sendData)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            console.log(res);
            this.get();
            //this.router.navigate(['admin/dashboard']);
            this.message = ['Successfully Saved.'];
            this.modalRef = this.modalService.show(this.messagebox);
          } else {
            this.message = ['Something problem.'];
            if (res['message']) {
              this.message[res['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          console.log(err);
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  delete() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('denied/delete/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/incomplete']);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  Pending() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('denied/pending/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/loan-stages/pending/' + id]);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  onsubmit(type: any) {
    this.apibtn = true;

    let approveid = this.route.snapshot.paramMap.get('id');
    let resvalues = this.apForms.value;
    let resdata = {
      procedure_startdate: resvalues.startdate,
      payment_duedate: resvalues.duedate,
    };
    //console.log('////',approveid,'/////',this.loanid)
    this.confirmdate = resvalues.startdate;

    if (!this.apForms.invalid) {
      this.service
        .put(
          'loanstage/UpdatePendingApplicationStatus/' + this.loanid,
          'admin',
          resdata
        )
        .pipe(first())
        .subscribe((res) => {
          if (res['statusCode'] == 200) {
            this.modalRef.hide();
            if (type != 'updateprocedure') {
              this.router.navigate(['admin/loan-stages/approved/' + approveid]);
            }
          } else {
            this.message = res['message'];
          }
          (err) => {
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          };
        });
    } else {
    }
  }

  counter(i: number) {
    return new Array(i);
  }
  offer_init() {
    this.offer_get();
    this.offer_form = new FormGroup({
      financialAmount: new FormControl(0, [
        Validators.required,
        Validators.pattern(readyMade.pattern.number),
      ]),
      interestRate: new FormControl(0, [
        Validators.required,
        Validators.pattern(readyMade.pattern.decimal),
      ]),
      duration: new FormControl(0, [
        Validators.required,
        Validators.pattern(readyMade.pattern.number),
      ]),
      originationFee: new FormControl(0, [
        Validators.required,
        Validators.pattern(readyMade.pattern.number),
      ]),
    });
  }
  offer_get() {
    this.service
      .get('loanoffers/offerslist/' + this.id, 'admin')
      .pipe(first())
      .subscribe(
        (res: any) => {
          if (res['statusCode'] == 200) {
            this.eligibleOfferDetails = res['data'];
          } else {
            this.message = res['message'];
            this.service.showError(this.message[0]);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.service.showError(this.message[0]);
        }
      );
  }
  offer_edit(index) {
    this.offer_inputIndex = index;
    this.eligibleOfferDetails[index].dynamicMonthlyAmount =
      this.eligibleOfferDetails[index].monthlyAmount;
    this.offer_form.patchValue({
      financialAmount: this.eligibleOfferDetails[index].financialAmount,
      interestRate: this.eligibleOfferDetails[index].interestRate,
      duration: this.eligibleOfferDetails[index].duration,
      originationFee: this.eligibleOfferDetails[index].originationFee,
    });
    //console.log(this.offer_form.value, this.eligibleOfferDetails[index]);
  }
  offer_colse(index) {
    if (!this.eligibleOfferDetails[index].id) {
      //create colse
      this.eligibleOfferDetails.splice(index, 1);
    }
    this.offer_inputIndex = -1;
  }
  offer_save(index) {
    if (this.offer_form.invalid) {
      this.service.showError('Offer information is not vaild');
    } else {
      let offerData: any = this.offer_form.value;
      let sendData: any = {
        loan_id: this.id,
        financialAmount: Number(offerData.financialAmount),
        interestRate: Number(offerData.interestRate),
        duration: Number(offerData.duration),
        originationFee: Number(offerData.originationFee),
      };
      if (this.eligibleOfferDetails[index].id) {
        // edit save
        sendData.offer_id = this.eligibleOfferDetails[index].id;
        this.service
          .authpost('loanoffers/updateoffer/', 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res: any) => {
              if (res['statusCode'] == 200) {
                this.service.showSuccess(res['message'][0]);
                this.eligibleOfferDetails = res['data'];
                this.offer_inputIndex = -1;
              } else {
                this.message = res['message'];
                this.service.showError(this.message[0]);
              }
            },
            (err) => {
              if (err['error']['message'].isArray) {
                this.message = err['error']['message'];
              } else {
                this.message = [err['error']['message']];
              }
              this.service.showError(this.message[0]);
            }
          );
      } else {
        // create save
        this.service
          .authpost('loanoffers/createoffer/', 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res: any) => {
              if (res['statusCode'] == 200) {
                this.service.showSuccess(res['message'][0]);
                this.eligibleOfferDetails = res['data'];
                this.offer_inputIndex = -1;
              } else {
                this.message = res['message'];
                this.service.showError(this.message[0]);
              }
            },
            (err) => {
              if (err['error']['message'].isArray) {
                this.message = err['error']['message'];
              } else {
                this.message = [err['error']['message']];
              }
              this.service.showError(this.message[0]);
            }
          );
      }
    }
  }
  offer_create() {
    this.eligibleOfferDetails.push({
      dynamicMonthlyAmount: 0,
      offerType: 'GeneratedByAdmin',
    });
    this.offer_form.patchValue({
      financialAmount: '',
      interestRate: '',
      duration: '',
      originationFee: '',
    });
    this.offer_inputIndex = this.eligibleOfferDetails.length - 1;
  }
  offer_delete(index) {
    let conf: boolean = confirm('Are you sure want to delete this offer?');
    if (conf) {
      let offer_id = this.eligibleOfferDetails[index].id;
      this.service
        .authget('loanoffers/deleteoffer/' + offer_id, 'admin')
        .pipe(first())
        .subscribe(
          (res: any) => {
            if (res['statusCode'] == 200) {
              this.eligibleOfferDetails = res['data'];
              this.service.showSuccess(res['message'][0]);
              this.offer_inputIndex = -1;
            } else {
              this.message = res['message'];
              this.service.showError(this.message[0]);
            }
          },
          (err) => {
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }
            this.service.showError(this.message[0]);
          }
        );
    }
  }
  offer_calc(index) {
    if (!this.offer_form.invalid) {
      let offerData = this.offer_form.value;
      let monthly = FinanceInatance.findPaymentAmount(
        Number(offerData.financialAmount),
        Number(offerData.interestRate),
        Number(offerData.duration)
      );
      this.eligibleOfferDetails[index].dynamicMonthlyAmount = monthly;
    }
  }
  offer_send_mail() {
    this.service
      .authget('loanoffers/sendoffer/' + this.id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.service.showSuccess(res['message'][0]);
            this.router.navigate(['admin/loan-stages/waiting/' + this.id]);
          } else {
            this.message = res['message'];
            this.service.showError(this.message[0]);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.service.showError(this.message[0]);
        }
      );
  }
  div1Function(exp: any) {
    switch (exp) {
      case 'user info': {
        this.div1 = true;
        this.isActive1 = 'active';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'User information';
        break;
      }
      case 'credit report': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = true;
        this.isActive2 = 'active';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Credit Report';
        break;
      }
      case 'bank account': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = true;
        this.isActive3 = 'active';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Bank Accounts';
        this.Bankaccountfun('');
        break;
      }
      case 'employment': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = true;
        this.isActive4 = 'active';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Employment';
        break;
      }
      case 'payment schedule': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = true;
        this.isActive5 = 'active';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Payment Schedule';
        break;
      }
      case 'document center': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = true;
        this.isActive6 = 'active';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Document Center';
        break;
      }
      case 'counter offer': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = true;
        this.isActive7 = 'active';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Counter Offer';
        this.countertoggle('');
        break;
      }
      case 'comments': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = true;
        this.isActive8 = 'active';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'Comments';
        break;
      }
      case 'log': {
        this.div1 = false;
        this.isActive1 = '';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = true;
        this.isActive9 = 'active';
        this.titleval = 'Log Activity Details';
        this.getlogs();
        break;
      }
      default: {
        this.div1 = true;
        this.isActive1 = 'active';
        this.div2 = false;
        this.isActive2 = '';
        this.div3 = false;
        this.isActive3 = '';
        this.div4 = false;
        this.isActive4 = '';
        this.div5 = false;
        this.isActive5 = '';
        this.div6 = false;
        this.isActive6 = '';
        this.div7 = false;
        this.isActive7 = '';
        this.div8 = false;
        this.isActive8 = '';
        this.div9 = false;
        this.isActive9 = '';
        this.titleval = 'User Information';
        break;
      }
    }
  }
  Bankaccountfun(exp: any) {
    switch (exp) {
      case 'user info': {
        this.bdiv1 = true;
        this.Bactive1 = 'active';
        this.bdiv2 = false;
        this.Bactive2 = '';
        this.bdiv3 = false;
        this.Bactive3 = '';
        break;
      }
      case 'caccount info': {
        this.bdiv1 = false;
        this.Bactive1 = '';
        this.bdiv2 = true;
        this.Bactive2 = 'active';
        this.bdiv3 = false;
        this.Bactive3 = '';
        break;
      }
      case 'haccount info': {
        this.bdiv1 = false;
        this.Bactive1 = '';
        this.bdiv2 = false;
        this.Bactive2 = '';
        this.bdiv3 = true;
        this.Bactive3 = 'active';
        break;
      }
      default: {
        this.bdiv1 = true;
        this.Bactive1 = 'active';
        this.bdiv2 = false;
        this.Bactive2 = '';
        this.bdiv3 = false;
        this.Bactive3 = '';
        break;
      }
    }
  }
  plaidfunction(exp: any) {
    console.log('ID=>', exp);
    this.activehistindex = exp;
    switch (exp) {
      case exp: {
        this.pdiv1 = true; //!this.pdiv1;
        this.Bactive1 = 'active';
        this.iterableval = exp;
        break;
      }
      default: {
        this.pdiv1 = true;
        this.Bactive1 = 'active';
        break;
      }
    }
  }
  countertoggle(exp: any) {
    switch (exp) {
      case 'generate': {
        this.cdiv1 = true;
        this.cactive1 = 'active';
        this.cdiv2 = false;
        this.cactive2 = '';
        break;
      }
      case 'create': {
        this.cdiv1 = false;
        this.cactive1 = '';
        this.cdiv2 = true;
        this.cactive2 = 'active';
        break;
      }
      default: {
        this.cdiv1 = true;
        this.cactive1 = 'active';
        this.cdiv2 = false;
        this.cactive2 = '';
        break;
      }
    }
  }
  empdetails() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('loan/getempdetails/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.empdata = res['data'];
            console.log(res);

            switch (this.empdata[0].payfrequency) {
              case 'M': {
                this.payfrequency = 'M';
                this.payfrequency1 = 'Monthly';
                break;
              }
              case 'B': {
                this.payfrequency = 'B';
                this.payfrequency1 = 'Bi-Weekly';
                break;
              }
              case 'S': {
                this.payfrequency = 'S';
                this.payfrequency1 = 'Semi-Monthly';
                break;
              }
              case 'W': {
                this.payfrequency = 'W';
                this.payfrequency1 = 'Weekly';
                break;
              }
              default: {
                this.payfrequency = 'Monthly';
                break;
              }
            }
            if (this.empdata[0].scheduledate != null) {
              this.lastpaydate = new Date(
                this.empdata[this.empdata.length - 1].scheduledate
              )
                .toISOString()
                .split('T')[0];
              this.nextpaydate = new Date(this.empdata[0].scheduledate)
                .toISOString()
                .split('T')[0];
              this.secondpaydate = new Date(this.empdata[1].scheduledate)
                .toISOString()
                .split('T')[0];
            }
            // this.createddate = new Date(this.empdata[0].createdat).toISOString().split('T')[0];
            //this.empdata[0].payfrequency = this.payfrequency;
            console.log('hello', this.empdata[0]);
            this.employInfo.patchValue(
              JSON.parse(JSON.stringify(this.empdata[0]))
            );
            this.employInfo.patchValue({ payfrequency: this.payfrequency });

            // this.employincomeInfo.patchValue(this.empdata[0]);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  gethistoricalbankacc(id) {
    this.service.authget('plaid/historicalBalance/' + id, 'admin').subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.historybalance = res['data'];
          this.historyacno = res['acno'];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getBankaccuserinfo(id) {
    this.service.get('plaid/bankUserInfo/' + id, 'admin').subscribe(
      (res) => {
        if (res['statusCode'] == 200) {
          this.accountholderdet = res['data'];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  updateEmpdetails() {
    console.log('come');
    let id = this.route.snapshot.paramMap.get('id');
    let employData: any = this.employInfo.value;
    console.log('employData =', employData);
    this.service
      .put('loanstage/updateemploydetails/' + id, 'admin', employData)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.empdetails();
            this.editEmpdata = false;
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  getActiveclass(index) {
    var header = document.getElementById('myDIV');
    var btns = header.getElementsByClassName('bank_Menu');
    var dt = btns[index];
    for (var i = 0; i < btns.length; i++) {
      if (i != index) {
        btns[i].classList.remove('activeBankMenu');
      }
    }
    dt.classList.add('activeBankMenu');
  }
}
