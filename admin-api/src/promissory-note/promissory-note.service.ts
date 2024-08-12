import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserConsentRepository } from '../repository/userConsent.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { LoanRepository } from '../repository/loan.repository';
import { CreatePromissoryNoteDto } from '../promissory-note/dto/promissory-note.dto';
import { commonService } from '../common/helper-service';
import { userConsentEnity } from '../entities/userConsent.entity';
import { LogRepository } from '../repository/log.repository';
import { Flags, StatusFlags } from '../entities/loan.entity';

@Injectable()
export class PromissoryNoteService {
  constructor(
    @InjectRepository(UserConsentRepository)
    private readonly userConesnetRepo: UserConsentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}
  async getPromissoryNote(loan_id) {
    const entityManager = getManager();
    try {
      const getUserID = await entityManager.query(
        `SELECT user_id FROM loan where id = '${loan_id}'`,
      );
      const getUserDetails = await entityManager.query(
        `SELECT * FROM customer where user_id = '${getUserID[0].user_id}'`,
      );
      const promissoryNote = new SignningPromissoryNote(getUserDetails[0]);
      const html = promissoryNote.getHtml();
      return {
        statusCode: 200,
        data: html,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async saveUserConsent(saveData: any) {
    try {
      const responseData = await this.userConesnetRepo.save(saveData);
      console.log(saveData);
      console.log('Test passed 2');
      return responseData;
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async savePromissoryNote(
    loanid,
    createPromissoryNoteDto: CreatePromissoryNoteDto,
  ) {
    const entityManager = getManager();
    try {
      const currentDate = new Date();
      await this.loanRepository.update(
        { id: loanid },
        {
          signature: createPromissoryNoteDto.signature,
          date: currentDate,
        },
      );
      const getUserID = await entityManager.query(
        `SELECT user_id FROM loan where id = '${loanid}'`,
      );
      const getUserDetails = await entityManager.query(
        `select * from customer where loan_id = '${loanid}'`,
      );
      const pn = new SignningPromissoryNote(getUserDetails[0]);
      const htmlData = pn.getHtmlWithSign(createPromissoryNoteDto.signature);
      const cs = new commonService(this.logRepository);
      const fileName = 'PromissoryNote.pdf';

      const promissoryNote = await cs.convertHTMLToPDF(
        loanid,
        htmlData,
        fileName,
      );
      const consentEntity = new userConsentEnity();
      // if (
      //   Object.keys(promissoryNote).length > 0 &&
      //   promissoryNote.Location != undefined
      // ) {
      consentEntity.loanid = loanid;
      consentEntity.filekey = 105;
      consentEntity.filepath = promissoryNote.key;
      this.saveUserConsent(consentEntity);
      console.log('Test passed 1');
      console.log(consentEntity);
      // }
      await this.loanRepository.update(
        { id: loanid },
        { lastscreen: 'completed', status_flag: StatusFlags.fundingcontract },
      );
      return {
        statusCode: 200,
        data: promissoryNote,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
export class SignningPromissoryNote {
  data: any = {};
  constructor(data) {
    this.data = data;
  }
  getHtml() {
    this.data;
    const htmlData = `<h1>${this.data.firstname + ' ' + this.data.lastname}</h1>
    <p>${this.data.email}<p>
    <p>${this.data.createdat.toISOString()}</p>
    <img id="sign" src = "{({signature})}">
    `;
    return htmlData;
  }
  getHtmlWithSign(signature) {
    let htmlData = this.getHtml();
    htmlData = htmlData.replace('{({signature})}', signature);
    return htmlData;
  }
}
