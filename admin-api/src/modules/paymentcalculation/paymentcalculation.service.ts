import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class PaymentcalculationService {
  findPaymentAmount(loanamount: number, arr: number, duration: number): number {
    var monthly: any;
    var principal = loanamount ? loanamount : 0;
    var interest = Number(arr ? arr : 0) / 100 / 12;
    var payments = Number(duration ? duration : 0);
    var x = Math.pow(1 + interest, payments);
    monthly = (principal * x * interest) / (x - 1);
    if (
      !isNaN(monthly) &&
      monthly != Number.POSITIVE_INFINITY &&
      monthly != Number.NEGATIVE_INFINITY
    ) {
      monthly = this.round(monthly);
    }
    return monthly;
  }
  round(x: number): number {
    return Math.round(x * 100) / 100;
  }

  RealAPR(loanamount, monthlypayment, term, apr, originFess) {
    var rate_per_period = apr / 100 / 12;
    var interest = rate_per_period;
    var futureValue = 0;
    var dueEndOrBeginning = 0;
    var paymentsPerYear = term;
    var paymentAmount = -monthlypayment.toFixed(2);
    var presentValue = loanamount - originFess;
    var FINANCIAL_MAX_ITERATIONS = 128; //Bet accuracy with 128
    var FINANCIAL_PRECISION = 0.0000001; //1.0e-8

    var y,
      y0,
      y1,
      x0,
      x1 = 0,
      f = 0,
      i = 0;
    var rate = interest;
    if (Math.abs(rate) < FINANCIAL_PRECISION) {
      y =
        presentValue * (1 + paymentsPerYear * rate) +
        paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear +
        futureValue;
    } else {
      f = Math.exp(paymentsPerYear * Math.log(1 + rate));
      y =
        presentValue * f +
        paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) +
        futureValue;
    }
    y0 = presentValue + paymentAmount * paymentsPerYear + futureValue;
    y1 =
      presentValue * f +
      paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) +
      futureValue;

    // find root by Newton secant method
    i = x0 = 0.0;
    x1 = rate;
    while (
      Math.abs(y0 - y1) > FINANCIAL_PRECISION &&
      i < FINANCIAL_MAX_ITERATIONS
    ) {
      rate = (y1 * x0 - y0 * x1) / (y1 - y0);
      x0 = x1;
      x1 = rate;
      if (Math.abs(rate) < FINANCIAL_PRECISION) {
        y =
          presentValue * (1 + paymentsPerYear * rate) +
          paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear +
          futureValue;
      } else {
        f = Math.exp(paymentsPerYear * Math.log(1 + rate));
        y =
          presentValue * f +
          paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) +
          futureValue;
      }
      y0 = y1;
      y1 = y;
      ++i;
    }
    return rate * 100 * 12;
  }

  async findPaymentAmountWithOrigination(
    loanamount: number,
    apr: number,
    duration: number,
    originationAmount: number,
  ) {
    let result: any = {},
      realAPR,
      monthlyAmount,
      totalAmount;
    monthlyAmount = this.findPaymentAmount(loanamount, apr, duration);
    totalAmount = monthlyAmount * duration;
    realAPR = (originationAmount > 0) ? this.RealAPR(loanamount, monthlyAmount, duration, apr, originationAmount) : 0;
    //result
    result.monthlyAmount = this.round(monthlyAmount);
    result.totalAmount = this.round(totalAmount);
    result.realAPR = this.round(realAPR);
    result.totalInerst = this.round(totalAmount - loanamount);
    result.totalInerstPlusFee = this.round(
      result.totalInerst + originationAmount,
    );
    result.actuallyReceived = this.round(
      totalAmount - result.totalInerstPlusFee,
    );
    return result;
  }

  createPaymentReScheduler(
    amount,
    apr,
    term,
    createdat,
    paymentfrequency,
    loan_id,
  ) {
    let paymentScheduler = [];
    var principal = Number(amount);
    var interest = Number(apr) / 100 / 12;
    var payments = Number(term);
    var x = Math.pow(1 + interest, payments);
    var monthly: any = (principal * x * interest) / (x - 1);
    if (
      !isNaN(monthly) &&
      monthly != Number.POSITIVE_INFINITY &&
      monthly != Number.NEGATIVE_INFINITY
    ) {
      monthly = this.round(monthly);
      for (let i = 0; i < payments; i++) {
        let inter = this.round((principal * Number(apr)) / 1200);
        let pri = this.round(monthly - inter);
        let scheduledate: any = '';
        if (paymentfrequency == 'M') {
          scheduledate = (() => {
            return new Date(
              new Date(createdat).setMonth(
                new Date(createdat).getMonth() + (i + 0),
              ),
            )
              .toISOString()
              .substring(0, 10);
          })();
        }
        if (paymentfrequency == 'B') {
          scheduledate = (() => {
            return new Date(
              new Date(createdat).setDate(
                new Date(createdat).getDate() + i * 14,
              ),
            )
              .toISOString()
              .substring(0, 10);
          })();
        }
        if (paymentfrequency == 'S') {
          scheduledate = (() => {
            return new Date(
              new Date(createdat).setDate(
                new Date(createdat).getDate() + i * 15,
              ),
            )
              .toISOString()
              .substring(0, 10);
          })();
        }
        if (paymentfrequency == 'W') {
          scheduledate = (() => {
            return new Date(
              new Date(createdat).setDate(
                new Date(createdat).getDate() + i * 7,
              ),
            )
              .toISOString()
              .substring(0, 10);
          })();
        }
        paymentScheduler.push({
          loan_id: loan_id,
          unpaidprincipal: principal,
          principal: pri,
          interest: inter,
          fees: 0,
          amount: monthly,
          scheduledate: scheduledate,
        });
        principal = this.round(principal - pri);
      }
      return paymentScheduler;
    }
  }
}
