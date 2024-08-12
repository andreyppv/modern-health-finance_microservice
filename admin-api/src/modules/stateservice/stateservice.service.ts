import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class StateserviceService {
  async get() {
    const entityManager = getManager();
    let data: any = {};
    try {
      const rawdata = await entityManager.query(
        `SELECT state_code,state_service,apr FROM stateservice`,
      );
      data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
