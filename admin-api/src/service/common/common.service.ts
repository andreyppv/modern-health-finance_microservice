import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  readonly offersTerms: any = [10, 15, 18, 24];
  readonly interestRate: any = [22.9, 24.9, 25.8, 25.9];
  constructor() {}
  round(x: number): number {
    return Math.round(x * 100) / 100;
  }
  findPaymentAmountMonthly(
    loanamount: number,
    arr: number,
    duration: number,
  ): number {
    var monthly: any;
    var principal = loanamount ? loanamount : 0;
    // console.log(principal);
    var interest = Number(arr ? arr : 0) / 100 / 12;
    // console.log(interest);
    var payments = Number(duration ? duration : 0);
    // console.log(payments);
    var x = Math.pow(1 + interest, payments);
    // console.log(x);
    monthly = (principal * x * interest) / (x - 1);
    if (
      !isNaN(monthly) &&
      monthly != Number.POSITIVE_INFINITY &&
      monthly != Number.NEGATIVE_INFINITY
    ) {
      monthly = this.round(monthly);
      // console.log('monthly', monthly);
    }
    return monthly;
  }

  findPaymentAmountBiweekly(
    loanamount: number,
    arr: number,
    duration: number,
  ): number {
    var biweekly: any;
    var principal = loanamount ? loanamount : 0;
    var interest = Number(arr ? arr : 0) / 100 / 26;
    var payments = Number(duration ? duration : 0);
    var x = Math.pow(1 + interest, payments);
    biweekly = (principal * x * interest) / (x - 1);
    if (
      !isNaN(biweekly) &&
      biweekly != Number.POSITIVE_INFINITY &&
      biweekly != Number.NEGATIVE_INFINITY
    ) {
      biweekly = this.round(biweekly);
    }
    return biweekly;
  }

  findPaymentAmountSemiMonthly(
    loanamount: number,
    arr: number,
    duration: number,
  ): number {
    var semimonthly: any;
    var principal = loanamount ? loanamount : 0;
    var interest = Number(arr ? arr : 0) / 100 / 24;
    var payments = Number(duration ? duration : 0);
    var x = Math.pow(1 + interest, payments);
    semimonthly = (principal * x * interest) / (x - 1);
    if (
      !isNaN(semimonthly) &&
      semimonthly != Number.POSITIVE_INFINITY &&
      semimonthly != Number.NEGATIVE_INFINITY
    ) {
      semimonthly = this.round(semimonthly);
    }
    return semimonthly;
  }
}
