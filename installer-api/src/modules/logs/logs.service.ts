import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity, LogTypeFlags } from 'src/entities/log.entity';
import { LogRepository } from 'src/repository/log.repository';
import { LogInLogsDto, Logs } from './dto/logs.dto';

@Injectable()
export class LogsService {    
    
    constructor(@InjectRepository(LogRepository) private readonly logRepository:LogRepository){}

    async logs(logs:Logs){
        let log = new LogEntity();
        log.module = logs.module;
        log.user_id = logs.user_id;
        log.loan_id = logs.loan_id;
        log.type = LogTypeFlags[logs.type]

        try{
            this.logRepository.save(log)
            return {"statusCode": 200};
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async addLoginLog(logInLogsDto:LogInLogsDto, ip){     
        try{
            let log = new LogEntity();
            log.module = 'User Logged In from IP:'+ip;
            log.user_id = logInLogsDto.user_id;
            log.type = LogTypeFlags['login']

            await this.logRepository.save(log)
            return {"statusCode": 200};
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
