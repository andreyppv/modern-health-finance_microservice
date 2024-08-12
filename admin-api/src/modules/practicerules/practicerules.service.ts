import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flags, PracticeRulesEntity } from 'src/entities/practiceRules.entity';
import { LogRepository } from 'src/repository/log.repository';
import { PracticeRulesRepository } from 'src/repository/practiceRules.respository';
import { getManager } from 'typeorm';
import { PracticeRulesDto } from './dto/addpracticerules.dto';
import { HttpService } from '@nestjs/axios';
import { Creditreport } from 'src/entities/creditreport.entity';
@Injectable()
export class PracticerulesService {
  constructor(
    @InjectRepository(PracticeRulesRepository)
    private readonly practiceRulesRepository: PracticeRulesRepository,
    private readonly httpservice: HttpService,
  ) {}

  async addPracticeRulesSetting(practiceRulesDto: PracticeRulesDto) {
    try {
      let entityManager = getManager();
      let practiceRulesEntity = new PracticeRulesEntity();

      if (practiceRulesDto.setting_name.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['Practice rules setting name should not be empty'],
          error: 'Bad Request',
        };
      } else {
        practiceRulesEntity.setting_name = practiceRulesDto.setting_name;
      }

      practiceRulesEntity.isdefault = practiceRulesDto.isDefault;
      practiceRulesEntity.deny_tiers = practiceRulesDto.deny_tiers;
      practiceRulesEntity.enable_transunion = practiceRulesDto.enable_plaid;
      practiceRulesEntity.enable_plaid = practiceRulesDto.enable_plaid;

      let target = await this.practiceRulesRepository.save(practiceRulesEntity);
      console.log(target);
      const data1 = await this.httpservice
        .post(
          process.env.creditreport + 'api/Rules/SettingRule/' + target.ref_no,
        )
        .toPromise();
      let res = data1.data;
      console.log(data1);

      return {
        statusCode: 200,
        message: ['success'],
        data: target,
        dotRes: data1.data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  //Get all practice rules
  async getAll() {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select * from practicerules where delete_flag ='N'`,
      );
      if (data.length > 0) {
        return { statusCode: 200, message: ['success'], data: data };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getId(setting_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select * from practicerules where delete_flag ='N' and ref_no='${setting_id}'`,
      );
      if (data.length > 0) {
        return { statusCode: 200, message: ['success'], data: data };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async updatePracticeRules(setting_id, practicerulesDto: PracticeRulesDto) {
    try {
      let entityManager = getManager();
      let target = await entityManager.query(
        `select * from practicerules where ref_no='${setting_id}'`,
      );
      if (target.length > 0) {
        await this.practiceRulesRepository.update(
          { ref_no: setting_id },
          {
            setting_name: practicerulesDto.setting_name,
            isdefault: practicerulesDto.isDefault,
            deny_tiers: practicerulesDto.deny_tiers,
            enable_plaid: practicerulesDto.enable_plaid,
            enable_transunion: practicerulesDto.enable_transunion,
          },
        );
        return {
          statusCode: 200,
          message: ['success'],
        };
      } else {
        return { statusCode: 400, message: ['Invalid Setting Id'] };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deletePracticeRules(setting_id) {
    try {
      let entityManager = getManager();
      let target = await entityManager.query(
        `select count(*) from practicerules where ref_no='${setting_id}'`,
      );
      if (target.length > 0) {
        await this.practiceRulesRepository.update(
          { ref_no: setting_id },
          {
            delete_flag: Flags.Y,
          },
        );
        return {
          statusCode: 200,
          message: ['success'],
        };
      } else {
        return { statusCode: 400, message: ['Invalid settingId'] };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
