import { Controller,Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentMethodService } from './payment-method.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { bankAddDto } from './dto/bankAdd.dto';
import { bankUpdateDto } from './dto/bankUpdate.dto';
import { debitCardAddDto } from './dto/debitCardAdd.dto';
import { debitCardUpdateDto } from './dto/debitCardUpdate.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('payment-method')
@Controller('payment-method')
export class PaymentMethodController {

    constructor(private readonly paymentMethodService: PaymentMethodService) {}
    
    @Post('/bankadd')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Add bank account" })
    async bankAdd(
    @Body() bankAddDto:bankAddDto
    ){
        console.log('bankAddDto', bankAddDto);
        
        return this.paymentMethodService.bankAdd(bankAddDto)
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

    @Post('/debitcardadd')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "" })
    async debitCardAdd(
    @Body() debitCardAddDto:debitCardAddDto
    ){
        return this.paymentMethodService.debitCardAdd(debitCardAddDto)
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

    @Get('/transactionlist/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Transaction List" })
    async transactionlist(
        @Param('userId') userId: string 
    ){
        return this.paymentMethodService.transactionlist(userId)
    }
}
