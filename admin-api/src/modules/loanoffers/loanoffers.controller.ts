import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { LoanoffersService } from './loanoffers.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOfferDto, UpdateOfferDto } from './dto/loanoffers.dto';
import { RealIP } from 'nestjs-real-ip';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('LoanOffers')
// @ApiBearerAuth()
// @Roles('admin')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loanoffers')
export class LoanoffersController {
  constructor(private readonly loanoffersService: LoanoffersService) {}

  //offer list
  @Get('/offerslist/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get offers' })
  async offersList(@Param('loan_id') id: string) {
    return this.loanoffersService.getAll(id);
  }

  @Post('/createoffer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create offer' })
  async createoffer(
    @Body() createOfferDto: CreateOfferDto,
    @RealIP() ip: string,
  ) {
    return this.loanoffersService.create(createOfferDto);
  }

  @Post('/updateoffer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'update offer' })
  async updateoffer(
    @Body() updateOfferDto: UpdateOfferDto,
    @RealIP() ip: string,
  ) {
    return this.loanoffersService.update(updateOfferDto);
  }

  @Get('/deleteoffer/:offer_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'delete offer' })
  async deleteoffer(@Param('offer_id', ParseUUIDPipe) id: string) {
    return this.loanoffersService.delete(id);
  }

  //send_offer
  @Get('/sendoffer/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'send offers' })
  async send_offer(@Param('loan_id', ParseUUIDPipe) id: string) {
    return this.loanoffersService.send_offer(id);
  }
}
