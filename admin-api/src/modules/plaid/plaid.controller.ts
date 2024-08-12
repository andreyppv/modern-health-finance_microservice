import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlaidService } from './plaid.service';
import { TokenDto } from './dto/token-plaid.dto';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  ItemPublicTokenExchangeRequest,
} from 'plaid';
import { config } from 'dotenv';
config();

@ApiTags('Plaid')
@Controller('plaid')
export class PlaidController {
  constructor(private readonly plaidService: PlaidService) {}
  @Post('/savetoken/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save Token' })
  async savetoken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() tokenDto: TokenDto,
  ) {
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
          'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
        },
      },
    });

    const token: ItemPublicTokenExchangeRequest = {
      public_token: tokenDto.public_token,
    };
    try {
      const client = new PlaidApi(configuration);
      const response = await client.itemPublicTokenExchange(token);
      const access_token = response.data.access_token;
      return this.plaidService.savetoken(id, access_token, tokenDto.reconnect);
      // const accounts_response = await client.accountsGet({ access_token });
      // console.log(accounts_response.data.accounts)
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: error.response.data.error_message };
    }
    //return this.PlaidService.signIn(signinCreadentialsDto);
  }
  @Get('/accounts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Accounts' })
  async accounts(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.accounts(id);
  }

  @Get('/requestBank/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Connect Bank link generated' })
  async requestBank(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.request_bank_login(id);
  }

  @Get('/transactions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Transactions' })
  async transactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.transactions(id);
  }

  @Get('/accountsRepull/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request repull Accounts' })
  async repullAccounts(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.repullAccounts(id);
  }
  @Get('/historicalBalance/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all History Datas' })
  async getHistoricalBalance(@Param('id', ParseUUIDPipe) id: string) {
    console.log(id);
    return this.plaidService.getHistoricalBalance(id);
  }

  @Get('/btrrule/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get BTR Rule' })
  async btrrule(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.btrrule(id);
  }

  @Get('/bankUserInfo/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Account Holder Bank Details' })
  async getbankUserInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.plaidService.getbankUserInfo(id);
  }
}
