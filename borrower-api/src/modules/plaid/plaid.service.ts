
import { Injectable,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from '../../repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments,ItemPublicTokenExchangeRequest,Products,CountryCode } from 'plaid';
config();

@Injectable()
export class PlaidService {
    public plaidConfig: any; 
    constructor(@InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository){
        this.plaidConfig = {
            basePath: PlaidEnvironments[process.env.PLAID_EVE],
            baseOptions: {
              headers: {
                'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
                'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
              },
            },
          };
    }
    async savetoken(id,public_token){
        try {
            const configuration = new Configuration(this.plaidConfig);
  
      let token: ItemPublicTokenExchangeRequest = {
        public_token: public_token,
      };
      const client = new PlaidApi(configuration);
      const response = await client.itemPublicTokenExchange(token);
      const access_token = response.data.access_token;
        this.customerRepository.update({loan_id: id}, { plaid_access_token: access_token });
        return {"statusCode": 200}    
    }catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
          }
    }

    async plaidLinkToken(loan_id) {
       
        const configuration = new Configuration(this.plaidConfig);
        
        try {
          const client = new PlaidApi(configuration);
          const response = await client.linkTokenCreate({
            client_name: process.env.PLAIND_CLIENT_NAME,
            products:[Products.Auth, Products.Assets,Products.Transactions],
            country_codes:[CountryCode.Us],
            language:"en",
            user:{client_user_id:loan_id}
          });
          return {
            "statusCode": 200,
            "token": response.data.link_token,
            "data": response.data
          }
        } catch (error) {
          console.log(error);
          return {"statusCode": 400,"message": error.response.data.error_message}
        }
      }
}
