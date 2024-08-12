import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from 'src/repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';

@Injectable()
export class MainService {
    constructor(
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository        
    ){}

    async getApplicationsList(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['uploadcount'] = 0;
            data['verfiycount'] = 0;
            data['milestonecount'] = 0;
            let loanid = []
            let count = await entityManager.query(
                `select  
                    count(*), l.id, ii.status 
                from loan l 
                left join installinginfo ii on ii.loan_id = l.id 
                where l.status_flag='approved' 
                    and l.ins_user_id='${id}' 
                    and l.delete_flag='N' 
                    and (ii.status is null or ii.status = 'documentsUploaded' or ii.status = 'verifiedAndApproved' or ii.status = 'milestone1Completed' or ii.status = 'milestone2Completed' or ii.status = 'milestone3Completed' ) 
                group by l.id, ii.status`)
            for(let i = 0; i<count.length; i++){
                loanid.push(`'${count[i]['id']}'`)
                if(!count[i]['status']){
                    data['uploadcount'] = data['uploadcount']+1
                }else if(count[i]['status']=='documentsUploaded'){
                    data['verfiycount'] = data['verfiycount']+1
                }else if(count[i]['status']=='verifiedAndApproved' || count[i]['status']=='milestone1Completed' || count[i]['status']=='milestone2Completed' || count[i]['status']=='milestone3Completed'){
                    data['milestonecount'] = data['milestonecount']+1
                }
            }
            if(loanid.length>0){
                data['applicationsList'] = await entityManager.query(`select l.ref_no  as loan_ref, l.id as loan_id, c.ref_no as app_ref, c."firstname" as firstname, c."lastname" as lastname, c.email as email , c."createdat" as createdat from loan l join customer c on l.id = c.loan_id where l.status_flag='approved' and l.ins_user_id='${id}' and l.delete_flag='N' and l.id in (${loanid.join(',')}) order by l."createdat" desc`) 
            }else{
                data['applicationsList'] = []
            }
                     
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
