import { Body, Controller, HttpCode, HttpStatus, Post,Get,ParseUUIDPipe,Param, UseGuards, Put, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlaidService } from './plaid.service';
import { TokenDto } from './dto/token.dto';
import { config } from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments,ItemPublicTokenExchangeRequest,Products,CountryCode } from 'plaid';
config();


@ApiTags('Plaid')
@Controller('plaid')
export class PlaidController {
  constructor(private readonly plaidService: PlaidService) {
    
  }

  @Get('/plaidLinkToken/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get temp link token for user" })
  async plaidlogin(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
  ){
    return await this.plaidService.plaidLinkToken(loan_id);
  }

  @Post('/savetoken/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Save Token" })
  async savetoken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() tokenDto: TokenDto,
  ){
    return this.plaidService.savetoken(id,tokenDto.public_token)
  }
}
