import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class MakePaymentService {
    
    async projectStatus(id){      
        
        const entityManager = getManager();
        try{
            let data = {}
            data['projectStatus'] = await entityManager.
                query(`select status
                        from installinginfo t 
                        where loan_id = '${id}'
                        and status = 'projectCompleted'
                    `)                            
            return {"statusCode": 200, data:data };
            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
