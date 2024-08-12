import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { RealIP } from 'nestjs-real-ip';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserName, selectLoan } from '../review/dto/update-review.dto';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending details' })
  async getDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewService.getDetails(id);
  }

  @Patch('/edituserDetails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit User Details' })
  async updateUserDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserName: UpdateUserName,
    @RealIP() ip: string,
  ) {
    return this.reviewService.updateUserDetails(id, updateUserName, ip);
  }

  @Post('selectLoan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async selectLoan(@Body() selectLoan: selectLoan, @RealIP() ip: string) {
    return this.reviewService.selectLoan(selectLoan.loan_id, ip);
  }

  @Post('bankManual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '' })
  async bankManual(@Body() selectLoan: selectLoan, @RealIP() ip: string) {
    return this.reviewService.bankManual(selectLoan.loan_id, ip);
  }
}
