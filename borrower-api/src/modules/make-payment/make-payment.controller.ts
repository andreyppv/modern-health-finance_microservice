import { Controller, Get, HttpCode, HttpStatus, ParseUUIDPipe, Param,UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { MakePaymentService } from './make-payment.service';


export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('customer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('make-payment')
@Controller('make-payment')
export class MakePaymentController {

    constructor(private readonly makePaymentService: MakePaymentService) {}

    @Get('projectStatus/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "check project status" })
    async projectStatus(
      @Param('id', ParseUUIDPipe) id: string
    ){
        return this.makePaymentService.projectStatus(id);
    }
}
