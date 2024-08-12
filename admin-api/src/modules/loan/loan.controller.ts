import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Put,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { ContactInfoDto } from './dto/contactInfo.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PersonalInfoDto } from './dto/personalInfo.dto';
import { RealIP } from 'nestjs-real-ip';
import { EmploymentInfoDto } from './dto/employmentInfo.dto';
import { PlaidDto } from './dto/plaid.dto';
import { getManager, UpdateDateColumn } from 'typeorm';
import { CommonService } from 'src/service/common/common.service';
import { ElligibleOffer } from './dto/loanamount.dto';
import { signature, VerifyEmailDto } from './dto/create-loan.dto';
import { EditEmailDto } from './dto/update-email.dto';
import { EditPhonenumDto } from './dto/update-phonenum.dto';
import { Roles } from '../questions/questions.controller';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { extname } from 'path';
import { S3 } from 'aws-sdk';
import { userConsentEnity } from 'src/entities/userConsent.entity';

var fs = require('fs');
var pupeetree = require('puppeteer');

@ApiTags('loan')
// @ApiBearerAuth()
// @Roles('admin')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loan')
export class LoanController {
  constructor(
    private readonly loanService: LoanService,
    private readonly commonService: CommonService,
  ) {}

  @Post('/contactInfo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Contact Information' })
  async updateContactInfo(
    @Body() contactInfoDto: ContactInfoDto,
    @RealIP() ip: string,
  ) {
    const res = this.loanService.addContanctInfo(contactInfoDto, ip);
    const userDetails = await res.then(data => data);
    console.log(57);
    console.log(userDetails);
    if (
      userDetails.statusCode == 200 &&
      userDetails.loan_id != 'undefined' &&
      userDetails.loan_id != null &&
      userDetails.loan_id
    ) {
     // await this.automateUserConsentGenerate(userDetails.loan_id);
    }
    return userDetails;
  }

  @Post('/updatePersonalInfo/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Personal Information' })
  async updatePersonalInfo(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() personalInfoDto: PersonalInfoDto,
    @RealIP() ip: string,
  ) {
    return this.loanService.updatePersonalInfo(loan_id, personalInfoDto, ip);
  }

  @Post('/updateEmploymentInfo/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Employment Info' })
  async updateEmploymentInfo(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() employmentInfoDto: EmploymentInfoDto,
    @RealIP() ip: string,
  ) {
    return this.loanService.updateEmploymentInfo(
      loan_id,
      employmentInfoDto,
      ip,
    );
  }
  @Get('/getStage/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Stage' })
  async getStage(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanService.getstage(loan_id);
  }

  @Get('/get/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Stage' })
  async fake(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return {
      statusCode: 200,
    };
  }
  /*
   *Get public token
   */
  @Get('/plaidLinkToken/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get temp link token for user' })
  async plaidlogin(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @RealIP() ip: string,
  ) {
    let data = await this.loanService.plaidLinkToken(loan_id, ip);
    if (data.statusCode != 200) {
      this.savelog(
        loan_id,
        'get link token plaid failed (check user your infromation or plaid keys):' +
          ip,
      );
    }
    return data;
  }
  @Post('/plaidsavetoken/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save Plaid Public Token' })
  async plaidsavetoken(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() plaidDto: PlaidDto,
    @RealIP() ip: string,
  ) {
    try {
      this.savelog(loan_id, 'Plaid Login. IP :' + ip);
      return this.loanService.plaidsavetoken(
        loan_id,
        plaidDto.public_token,
        ip,
      );
    } catch (error) {
      return { statusCode: 400, message: error.response.data.error_message };
    }
  }
  async savelog(loan_id, message) {
    this.loanService.addLog(loan_id, message);
  }
  @Get('/generateOffer/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'System Generate Offer List' })
  async generateOffer(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @RealIP() ip: string,
  ) {
    try {
      this.savelog(loan_id, 'Plaid Login. IP :' + ip);
      return this.loanService.generateOffer(loan_id);
    } catch (error) {
      return { statusCode: 400, message: error.response.data.error_message };
    }
  }
  @Post('/saveEligibleOffer/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elligible Offer' })
  async elligibleOffer(
    @Param('id') id: string,
    @Body() elligibleOffer: ElligibleOffer,
    @RealIP() ip: string,
  ) {
    this.savelog(id, 'Save EligibleOffer:' + ip);
    return this.loanService.elligibleOffer(id, elligibleOffer, ip);
  }

  @Get('/getPromissoryNote/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Credit Promisory Note' })
  async getPromissoryNoteData(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
  ) {
    return await this.loanService.getPromissoryNoteData(loan_id);
  }

  @Post('/savePromissoryNote/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Promissory Note' })
  async savePromissoryNoteData(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() signature: signature,
  ) {
    return await this.loanService.savePromissoryNote(loan_id, signature);
  }

  // @Post('/verifyEmail')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Get Credit Application Details' })
  // async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
  //   return await this.loanService.verifyEmail(verifyEmailDto);
  // }

  @Get('/mailTriggering/promissoryNote/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mail Triggering For Promissory Note' })
  async getPromissoryNote(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return await this.loanService.mailTriggeringForPromissoryNote(loan_id);
  }

  @Get('/getPracticeDetailsByLoan/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'System Generate Offer List' })
  async getloanDetailsByLoanId(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @RealIP() ip: string,
  ) {
    try {
      // this.savelog(loan_id, 'Plaid Login. IP :' + ip);
      return this.loanService.getloanDetailsByLoanId(loan_id);
    } catch (error) {
      return { statusCode: 400, message: error.response.data.error_message };
    }
  }

  @Get('/Document/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all document files' })
  async getDocument(@Param('id') id: string) {
    return this.loanService.getDocument(id);
  }

  @Get('/verifyEmail/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email Verification' })
  async emailverify(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanService.emailverify(loan_id);
  }

  @Get('/triggerMail/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger an email to the user' })
  async triggermmail(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanService.triggerMail(loan_id);
  }

  @Put('/updateStage/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update loan stage' })
  async updateLoanStatus(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @RealIP() ip: string,
  ) {
    return this.loanService.updateLoanStatus(loan_id, ip);
  }

  @Put('/updateEmail/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Email' })
  async editEmail(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() editEmailDto: EditEmailDto,
    @RealIP() ip: string,
  ) {
    return this.loanService.editEmail(loan_id, editEmailDto, ip);
  }

  @Put('/updatePhonenum/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Phone Number' })
  async updatePhonenum(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() editPhoneDto: EditPhonenumDto,
  ) {
    return this.loanService.editPhonenum(loan_id, editPhoneDto);
  }

  @Get('/creditreport/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get creditreport' })
  async creditreport(@Param('id') id: string) {
    return this.loanService.creditreport(id);
  }
  //offer list
  @Get('/offerslist/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get offers' })
  async offersList(@Param('loan_id') id: string) {
    return this.loanService.getAll(id);
  }

  @Get('/bank-transaction-rules/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the endpoint for Bank Transaction Rules' })
  async btr(@Param('loan_id', ParseUUIDPipe) id: string) {
    return this.loanService.getAccounts(id);
  }

  @Get('/getempdetails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all Employee Details' })
  async getempdetails(@Param('id') id: string) {
    return this.loanService.getempdetails(id);
  }

  async automateUserConsentGenerate(loan_id: string) {
   console.log(305);
    const filepath = process.env.distRootPath;
    const consentData = [];
    const rawData = this.loanService.getConsentList();
    const fileData = await rawData.then(data => data);
    // console.log('fileDate------------>', fileData);
    console.log(312);
    for (let k = 0; k < fileData.length; k++) {
      let entityManager = getManager();
      let userData = await entityManager.query(`
        select pra."zipcode" as prazip, pra.city as pracity,pra."streetaddress" as prastreetaddress,
        pra."statecode" as prastatecode,pra."phonenumber" as praphonenumber,log.module as module, pra.email as praemail,* from customer cus
        join practice pra on pra.id = cus."practiceid"
        join log log on log.loan_id = cus.loan_id
        where cus.loan_id = '${loan_id}'
    `);
      //console.log(userData);
      console.log(323);
      let practicePhoneNo = userData[0].praphonenumber;
      let practiceName = userData[0].practicename;
      let userAddress = `${userData[0].prastreetaddress} ${userData[0].pracity} ${userData[0].prastatecode} ${userData[0].prazip}`;
      let practiceAddress = userData[0].prastreetaddress;
      let practiceCity = userData[0].pracity;
      let practiceState = userData[0].prastatecode;
      let practiceZipcode = userData[0].prazip;
      let practiceEmail = userData[0].praemail;
      let agreementDate = userData[0].createdat.toISOString().split('T')[0];
      let ip = userData[0].module.substr(28);
      let consentDoc = fs.readFileSync(
        `${filepath}/${fileData[k].filename}.html`,
        { encoding: 'utf-8', flag: 'r' },
      );
      // console.log('result====================>', consentDoc);
      if (userData.length > 0) {
        let replaceData = [
          { find: '{{LenderShortName}}', replace: practiceName },
          { find: '{{ practicePhone }}', replace: practicePhoneNo },
          { find: '{{LenderMailingAddress}}', replace: userAddress },
          { find: '{{ practiceName }}', replace: practiceName },
          { find: '{{ practiceAddress }}', replace: practiceAddress },
          { find: '{{ practiceCity }}', replace: practiceCity },
          { find: '{{ practiceState }}', replace: practiceState },
          { find: '{{ practiceZip }}', replace: practiceZipcode },
          { find: '{{ practiceEmail }}', replace: practiceEmail },
          { find: '{{LenderPhone}}', replace: practicePhoneNo },
          { find: '{{ agreementObject.date }}', replace: agreementDate },
          { find: '{{ ip }}', replace: ip },
        ];
        consentDoc = this.dynamicString(replaceData, consentDoc);
      }
      if (consentDoc != undefined) {
        const browser = await pupeetree.launch();
        const page = await browser.newPage();
        await page.setContent(consentDoc);

        const data = await page.pdf({
          path: 'myPdf.pdf',
          format: 'a4',
          printBackground: true,
        });

        await browser.close();
        // console.log('data==========>', data);
        const bucketS3 = 'modernhealth-staging';
        const stateName = 'CA';
        let fileName = 'mypdf.pdf';
        const name = fileName.split('.')[0];
        const fileExtName = extname(fileName);
        const randomName = Array(4)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        fileName = `${process.env.awsS3ChildFolderPath}${fileData[k].filename}-${loan_id}${fileExtName}`;
        const data1: any = await this.uploadS3(data, bucketS3, fileName);

        if (Object.keys(data1).length > 0 && data1.Location != undefined) {
          const consentEntity = new userConsentEnity();
          consentEntity.loanid = loan_id;
          consentEntity.filekey = fileData[k].filekey;
          consentEntity.filepath = fileName;
          consentData.push(consentEntity);

          // console.log('a------------>', a);
        }
      }
      await this.loanService.saveUserConsent(consentData);
    }
  }
  //upload File into S3 bucket
  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }
  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  dynamicString(replaceData: any, consentDoc: string): any {
    for (let i = 0; i < replaceData.length; i++) {
      let re = new RegExp(replaceData[i].find, 'g');
      //console.log(re);
      consentDoc = consentDoc.replace(re, replaceData[i].replace);
      // console.log('str=====================>>>>>>>', consentDoc);
      let d = replaceData[i].find;
      //console.log(d);
    }
    return consentDoc;
  }
}
