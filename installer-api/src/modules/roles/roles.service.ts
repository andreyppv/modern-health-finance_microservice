import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class RolesService {

      async getInstallerPortalRoles(){
        try{            
            const entityManager = getManager();
            const list = await entityManager.
                query(`select distinct 
                        r.id, 
                        r.name
                    from roles r
                    join rolesmaster rm on r.id = rm.role_id 
                    join portal p on p.id = rm.portal_id 
                    where 
                        p.name = 'installer'
                    and r.delete_flag ='N' 
                    order by r.id asc
                `)
            return {"statusCode": 200,data:list}
      } catch (error) {
          console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }
}
