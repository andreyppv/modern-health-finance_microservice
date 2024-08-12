import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { bankAddDto } from './dto/bankAdd.dto';
import { bankUpdateDto } from './dto/bankUpdate.dto';
import { debitCardAddDto } from './dto/debitCardAdd.dto';
import { debitCardUpdateDto } from './dto/debitCardUpdate.dto';
import { PaymentMethodService } from './payment-method.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('customer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('payment-method')
@Controller('payment-method')
export class PaymentMethodController {

    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    @Post('/debitcardadd')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "" })
    async debitCardAdd(
    @Body() debitCardAddDto:debitCardAddDto
    ){
        return this.paymentMethodService.debitCardAdd(debitCardAddDto)
    }
    
    @Post('/bankadd')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "" })
    async bankAdd(
    @Body() bankAddDto:bankAddDto
    ){
        console.log('bankAddDto', bankAddDto);
        
        return this.paymentMethodService.bankAdd(bankAddDto)
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get bank/card details" })
    async getOverview(
      @Param('id', ParseUUIDPipe) id: string
    ){
        return this.paymentMethodService.getBankCardDetails(id);
    }

    @Put('/bankchoose/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update user's active bank" })
    async bankChoose(
        @Param('userId') userId: string ,@Body() bankUpdateDto:bankUpdateDto
    ){
        console.log('bankUpdateDto', bankUpdateDto);
        
        return this.paymentMethodService.bankChoose(userId, bankUpdateDto)
    }

    @Put('/cardchoose/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update user's active card" })
    async cardChoose(
        @Param('userId') userId: string ,@Body() debitCardUpdateDto:debitCardUpdateDto
    ){
        console.log('debitCardUpdateDto', debitCardUpdateDto);
        
        return this.paymentMethodService.cardChoose(userId, debitCardUpdateDto)
    }

    @Put('/toggleAutoPay/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "update auto payment" })
    async toggleAutoPay(
        @Param('userId') userId: string ,@Body() toggleValue
    ){
        console.log('toggleValue', toggleValue);
        
        return this.paymentMethodService.toggleAutoPay(userId, toggleValue)
    }

    @Get('/cardpayment/:payamentid/:loanid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Card Payment" })
    async cardpayment(
        @Param('payamentid') payamentid: string,
        @Param('loanid') loanid: string,
    ){
        return this.paymentMethodService.cardpayment(payamentid,loanid)
    }
}
