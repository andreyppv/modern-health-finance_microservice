import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCreditpullDto } from './dto/create-creditpull.dto';
import { CustomerRepository } from '../../repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
// import { CreditscoreApi } from 'creditscoreapi-mortgage/CreditscoreApi';
import { CreditPullRepository } from '../../repository/creditPull.repository';
import { CreditPull } from '../../entities/creditPull.entity';
import { getManager } from 'typeorm';
import { config } from 'dotenv';
import { use } from 'passport';
import e from 'express';
config();

@Injectable()
export class CreditpullService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(CreditPullRepository)
    private readonly creditPullRepository: CreditPullRepository,
  ) {}

  async getCreditPullData(id) {
    //   const entityManager = getManager();
    //   try {
    //     const smartApi = {
    //       url: process.env.crsurl,
    //       username: process.env.crsusername,
    //       password: process.env.crspassword,
    //       interfaceIdentifierHeader: process.env.crsinterfaceIdentifierHeader,
    //     };
    //     const creditscoreApi = new CreditscoreApi(smartApi);
    //     let rawData = await entityManager.query(
    //       `SELECT "firstname","middlename","lastname","city","zipcode","state","streetaddress","socialsecuritynumber"
    //        FROM customer where "loan_id" = '${id}';`,
    //     );
    //     const stateData = await entityManager.query(
    //       `select "state_code" from stateservice where "state_service"='${rawData[0].state}'`,
    //     );
    //     rawData = rawData.map(value => {
    //       value.state_code = stateData[0].state_code;
    //       return value;
    //     });
    //     const userData: any = {};
    //     userData['FirstName'] = rawData[0].firstname;
    //     userData['LastName'] = rawData[0].lastname;
    //     userData['MiddleName'] = rawData[0].middlename;
    //     userData['SuffixName'] = '';
    //     userData['AddressLineText'] = rawData[0].streetaddress;
    //     userData['CityName'] = rawData[0].city;
    //     userData['CountryCode'] = process.env.CountryCode;
    //     userData['PostalCode'] = rawData[0].zipcode;
    //     userData['StateCode'] = rawData[0].state_code;
    //     userData['TaxpayerIdentifierValue'] = rawData[0].socialsecuritynumber;
    //     const creditDatacount = await entityManager.query(
    //       `SELECT  count(*) FROM creditpull where "loan_id"='${id}'`,
    //     );
    //     const objectsEqual = (userData, lastSendInformation) => {
    //       return (
    //         Object.keys(userData).length ===
    //           Object.keys(lastSendInformation).length &&
    //         Object.keys(userData).every(
    //           keys => userData[keys] === lastSendInformation[keys],
    //         )
    //       );
    //     };
    //     if (creditDatacount[0].count == 1) {
    //       const creditData = await entityManager.query(
    //         `SELECT  "vendorID" ,"lastSendInformation" FROM creditpull where "loan_id"='${id}'`,
    //       );
    //       if (creditData[0].vendorID) {
    //         const comparingobjectData = objectsEqual(
    //           userData,
    //           JSON.parse(creditData[0].lastSendInformation),
    //         );
    //         if (comparingobjectData) {
    //           var retrieveExixtingData = await creditscoreApi.retrieveExisting(
    //             userData,
    //             creditData[0].vendorID,
    //           );
    //         } else {
    //           retrieveExixtingData = await creditscoreApi.process(userData);
    //         }
    //         if (retrieveExixtingData.status == true) {
    //           await this.creditPullRepository.update(
    //             { loan_id: id },
    //             {
    //               lastResponse: retrieveExixtingData.lastResponse,
    //               file: retrieveExixtingData.response,
    //               vendorID: retrieveExixtingData.vendorOrderIdentifier,
    //               lastSendInformation: JSON.stringify(userData),
    //             },
    //           );
    //           return {
    //             statusCode: 200,
    //             data: retrieveExixtingData.response,
    //           };
    //         } else {
    //           return {
    //             statusCode: 400,
    //             error: retrieveExixtingData.error,
    //           };
    //         }
    //       }
    //     } else {
    //       const processData = await creditscoreApi.process(userData);
    //       const creditPull = new CreditPull();
    //       creditPull.loan_id = id;
    //       creditPull.lastResponse = processData.lastResponse;
    //       creditPull.vendorID = processData.vendorOrderIdentifier;
    //       creditPull.file = processData.response;
    //       creditPull.lastSendInformation = JSON.stringify(userData);
    //       if (processData.status == true) {
    //         await this.creditPullRepository.save(creditPull);
    //         return {
    //           statusCode: 200,
    //           data: processData.response,
    //         };
    //       } else {
    //         return {
    //           statusCode: 400,
    //           error: processData.error,
    //         };
    //       }
    //     }
    //   } catch (error) {
    //     console.log('error---->', error);
    //     return {
    //       statusCode: 500,
    //       message: [new InternalServerErrorException(error)['response']['name']],
    //       error: 'Bad Request',
    //     };
    //   }
  }

  async getFiles(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `SELECT  "file" FROM creditpull where "loan_id"='${id}'`,
      );
      return { statusCode: 200, data: rawData[0].file };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
