import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Put,
  Headers,
} from '@nestjs/common';
import {
  UpdateUserLoanAmount,
  manualBankAddDto,
  UpdatePendingapplicationDto,
  UpdateEmployInfo,
} from '../loanstage/dto/update-loanstage.dto';
import { LoanstageService } from './loanstage.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  UpdateStageDto,
  createPaymentSchedulerDto,
} from './dto/update-loanstage.dto';
import { RealIP } from 'nestjs-real-ip';
import { LoanoffersService } from './loanoffers.service';

@ApiTags('loanstage')
//@ApiBearerAuth()
//@Roles('admin')
//@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loanstage')
export class LoanstageController {
  constructor(
    private readonly loanstageService: LoanstageService,
    private readonly loanoffersService: LoanoffersService,
  ) {}

  @Get('/:stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GET_ALL' })
  async get(@Headers() headers, @Param('stage') stage: string) {
    let user_id = headers.userid;
    return this.loanstageService.getAllCustomerDetails(stage, user_id);
  }

  @Get('/:id/:stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending details' })
  async getdetails(
    @Param('id') id: string,
    @Param('stage') stage: string,
  ) {
    return this.loanstageService.getACustomerDetails(id, stage);
  }

  @Get('/getlogs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Logs' })
  async getlogs(@Param('id') id: string) {
    return this.loanstageService.getALogs(id);
  }

  @Post('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Updated to next stage' })
  async movedToNextStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.loanstageService.movedToNextStage(id, updateStageDto);
  }

  @Patch('/editcustomerloanamountdetails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit loan amount details' })
  async editCustomerLoanAmountDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserLoanAmount: UpdateUserLoanAmount,
  ) {
    return this.loanstageService.editCustomerLoanAmountDetails(
      id,
      updateUserLoanAmount,
    );
  }

  @Patch('/PaymentReschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment Reschedule ' })
  async paymentRescheduler(
    @Body() createPaymentSchedulerDto: createPaymentSchedulerDto,
  ) {
    return this.loanstageService.paymentRescheduler(createPaymentSchedulerDto);
  }

  @Post('/manualbankadd')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manual Bank Add' })
  async manualBankAdd(@Body() manualBankAddDto: manualBankAddDto) {
    return this.loanstageService.manualBankAdd(manualBankAddDto);
  }

  @Get('/Document/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all document files' })
  async getDocument(@Param('id') id: string) {
    return this.loanstageService.getDocument(id);
  }

  @Get('/userDocument/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user upload document files' })
  async getUserDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.loanstageService.getUserDocument(id);
  }

  @Put('/UpdatePendingApplicationStatus/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Pending application status' })
  async updatePendingApplication(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() updateApp: UpdatePendingapplicationDto,
  ) {
    return this.loanstageService.updatePendingApp(loan_id, updateApp);
  }

  @Put('/updateemploydetails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Employ Details' })
  async updateemploydetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployInfo: UpdateEmployInfo
  ) {
    return this.loanstageService.updateemploydetails(
      id,
      updateEmployInfo,
    );
  }

  @Put('/makearchive/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Make archive' })
  async MakeArchive(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanstageService.makeArchive(loan_id);
  }
  @Put('/setdenied/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set denied' })
  async setDenied(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanstageService.setdenied(loan_id);
  }

  @Put('/proceduredate/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Procedure Date' })
  async getProcedureStartDate(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
  ) {
    return this.loanstageService.getProcedureStartDate(loan_id);
  }

  @Put('/updateProcedureDate/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Procedure Date' })
  async updateProcedureDate(
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
    @Body() updateApp: UpdatePendingapplicationDto,
  ) {
    return this.loanstageService.updateProcedureDate(loan_id, updateApp);
  }

  @Put('/setfundingcontract/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set Funding Contract' })
  async setFundingContract(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.loanstageService.setFundingContract(loan_id);
  }
}
