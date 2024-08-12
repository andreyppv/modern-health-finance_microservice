import {
  Controller,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UpdateuserloanService } from './updateuserloan.service';
import { UpdateUserLoanAmount } from '../updateuserloan/dto/update-updateuserloan.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Update User Loan')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('updateuserloan')
export class UpdateuserloanController {
  constructor(private readonly updateuserloanService: UpdateuserloanService) {}
  @Patch('/edituserloanamountdetails/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit loan amount details' })
  async editUserLoanAmountDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserLoanAmount: UpdateUserLoanAmount,
  ) {
    return this.updateuserloanService.editUserLoanAmountDetails(
      id,
      updateUserLoanAmount,
    );
  }
}
