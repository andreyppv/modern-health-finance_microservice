import { Injectable,InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { SettingsRepository } from 'src/repository/settings.repository';
import { In } from 'typeorm';

@Injectable()
export class MilestoneFundService {
    constructor( 
        @InjectRepository(SettingsRepository) private readonly settingsRepository: SettingsRepository
    ) {}

    async getMilestonePer(){
        try {
            let milestoneFundPer = await this.settingsRepository.find({select:['value'], where:{key:In(['milestone1fundper', 'milestone2fundper', 'milestone3fundper'])}})
                  
            return {"statusCode": 200, data: milestoneFundPer} 
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
