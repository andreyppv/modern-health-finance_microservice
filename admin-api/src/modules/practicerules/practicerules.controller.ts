import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RealIP } from 'nestjs-real-ip';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from '../dashboard/dashboard.controller';
import { PracticeRulesDto } from './dto/addpracticerules.dto';
import { PracticerulesService } from './practicerules.service';

@ApiTags('practicerules')
// @ApiBearerAuth()
// @Roles('admin')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('practicerules')
export class PracticerulesController {
  constructor(private readonly practicerulesService: PracticerulesService) {}

  @Post('/addSetting')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add Practice rules Setting' })
  async addPracticeRulesSetting(@Body() practiceRulesDto: PracticeRulesDto) {
    return this.practicerulesService.addPracticeRulesSetting(practiceRulesDto);
  }

  @Get('/getAllPracticeRules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all Practice Rules ' })
  async getAllPracticeRules() {
    return this.practicerulesService.getAll();
  }

  @Get('/getPracticeRules/:setting_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get  Practice Rules By Id ' })
  async getPracticeRulesById(@Param('setting_id') setting_id: string) {
    return this.practicerulesService.getId(setting_id);
  }

  @Patch('/updatePracticeRules/:setting_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Practice rules by setting id ' })
  async updatePracticeRules(
    @Param('setting_id') setting_id: string,
    @Body() practiceRulesDto: PracticeRulesDto,
  ) {
    return this.practicerulesService.updatePracticeRules(
      setting_id,
      practiceRulesDto,
    );
  }
  
  @Put('/deletePracticeRules/:setting_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Contact Information' })
  async deletePracticeRules(@Param('setting_id') setting_id: string) {
    return this.practicerulesService.deletePracticeRules(setting_id);
  }
}
