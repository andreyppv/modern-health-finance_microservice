import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesEntity } from 'src/entities/files.entity';
import { InstallingInfo, InstallingStatusFlags } from 'src/entities/installingInfo.entity';
import { Flags, StatusFlags } from 'src/entities/loan.entity';
import { SystemInfo } from 'src/entities/systemInfo.entity';
import { Notification } from 'src/entities/notification.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallingInfoRepository } from 'src/repository/installingInfo.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { SystemInfoRepository } from 'src/repository/systemInfo.repository';
import { getManager } from 'typeorm';
import { CreateUploadDto } from './dto/createUpload.dto';
import { Milestone1ReqDto, Milestone2ReqDto, Milestone3ReqDto } from './dto/installingInfo.dto';
import { SystemInfoDto } from './dto/systemInfo.dto';
import { NotificationRepository } from 'src/repository/notification.repository';
import { CustomerRepository } from 'src/repository/customer.repository';
import { CommentsRepository } from 'src/repository/comments.repository';
import { AddCommentDto } from './dto/comment.dto';
import { MailService } from 'src/mail/mail.service';
import { Comments } from 'src/entities/comments.entity';
import { config } from 'dotenv';
import { Next } from './dto/next.dto';
config();

@Injectable()
export class CustomersService {

    constructor(
        @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
        @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
        @InjectRepository(SystemInfoRepository) private readonly systemInfoRepository: SystemInfoRepository,
        @InjectRepository(InstallingInfoRepository) private readonly installingInfoRepository: InstallingInfoRepository,
        @InjectRepository(NotificationRepository) private readonly notificationRepository: NotificationRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository,
        @InjectRepository(CommentsRepository) private readonly commentsRepository: CommentsRepository,
        private readonly mailService: MailService,
    ){

    }

    async getApplicationsList(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['applicationsList'] = await entityManager.query(`select c.*, ii.status, l.ref_no  as loan_ref from loan l join customer c on l.id = c.loan_id left join installinginfo ii on ii.loan_id = l.id where l.status_flag='approved' and l.ins_user_id='${id}' and l.delete_flag='N' order by l.ref_no desc`)          
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getApplicationDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['applicationDetails'] = await entityManager.query(`select c.*, ii.status, ii."milestone1paidAt", ii."milestone1TransactionId", ii."milestone2paidAt", ii."milestone2TransactionId", ii."milestone3paidAt", ii."milestone3TransactionId" from loan l join customer c on l.id = c.loan_id left join installinginfo ii on ii.loan_id = l.id where l.status_flag='approved' and l.delete_flag='N' and l.id='${id}'`);          
            data['creditedPaymentDetails'] = await entityManager.query(`select * from paymentmanagement where loan_id='${id}' and status='PAID' order by "createdat" asc`);
            data['totalCreditedPayment'] = await entityManager.query(`select sum("fundedAmount") as totalLoanPayment from paymentmanagement where loan_id='${id}' and status='PAID'`);
            data['milestoneFundPer'] = await entityManager.query(`select value from settings where key in ('milestone1fundper', 'milestone2fundper', 'milestone3fundper')`);
            data['files']=await entityManager.query(`select id, filename, originalname, verify_flag from files where link_id = '${id}' and "documenttype" = 'Proof of Ownership'`)
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async nextstep(next:Next){
        let installinfo = new InstallingInfo()
        installinfo.status = InstallingStatusFlags.documentsUploaded;
        installinfo.loan_id = next.loan_id;
        installinfo.user_id = next.user_id;
        try{
            await this.installingInfoRepository.save(installinfo)
            return { "statusCode": 200, "Loan_ID": next.loan_id}

        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async files_verify(id){
        try{ 
            this.filesRepository.update({id:id},{verify_flag:Flags.Y})
            return {"statusCode": 200}; 
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async customerFileUpload(files,createUploadDto: CreateUploadDto){
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/fileUpload';
            file.documenttype = createUploadDto.documentTypes[i];
            file.link_id = createUploadDto.loan_id;
            filedata.push(file)
        }
        let installinfo = new InstallingInfo()
        installinfo.status = InstallingStatusFlags.documentsUploaded;
        installinfo.loan_id = createUploadDto.loan_id;
        installinfo.user_id = createUploadDto.user_id;
        try{
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.save(installinfo)
            return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}

        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async systemInfoAdd(systemInfoDto: SystemInfoDto) {
        try{
            let systemInfo = new SystemInfo();
            systemInfo.moduleManufacturer = systemInfoDto.moduleManufacturer;
            systemInfo.inverterManufacturer = systemInfoDto.inverterManufacturer
            systemInfo.batteryManufacturer = systemInfoDto.batteryManufacturer
            systemInfo.systemSize = systemInfoDto.systemSize
            systemInfo.estAnnualProduction = systemInfoDto.estAnnualProduction
            systemInfo.signature = systemInfoDto.signature
            systemInfo.user_id = systemInfoDto.user_id
            systemInfo.loan_id = systemInfoDto.loan_id

           
            

            await this.systemInfoRepository.save(systemInfo)
            await this.installingInfoRepository.update({loan_id: systemInfoDto.loan_id},{
                status: InstallingStatusFlags.verifiedAndApproved
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    getamount(data){
        return Number(data.replace(",","").replace("$",""))
      }

    async milestone1Req(files, milestone1ReqDto: Milestone1ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone1Req';
            file.link_id = milestone1ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone1ReqDto.milestone1ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }

            this.savenotification("Milestone Request","Milestone 1 - Amount : "+amount,process.env.Notificationpath+milestone1ReqDto.loan_id)
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.update({loan_id: milestone1ReqDto.loan_id},{
                status: InstallingStatusFlags.milestone1Completed,
                milestone1ReqAmount:amount,
                milestone1signature:milestone1ReqDto.signature
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async milestone2Req(files, milestone2ReqDto: Milestone2ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone2Req';
            file.link_id = milestone2ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone2ReqDto.milestone2ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }
            let verfiy:any = true;
            if(milestone2ReqDto.verifiedInstAddress=='true'){
                verfiy = true;
            }else if(milestone2ReqDto.verifiedInstAddress=='false'){
                verfiy = false;
            }else{
                return {"statusCode": 500, "message": ['Bad Request'], "error": "Bad Request"};
            }
            this.savenotification("Milestone Request","Milestone 2 - Amount : "+amount,process.env.Notificationpath+milestone2ReqDto.loan_id)
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.update({loan_id: milestone2ReqDto.loan_id},{
                status: InstallingStatusFlags.milestone2Completed,
                milestone2ReqAmount:amount,
                milestone2signature:milestone2ReqDto.signature,
                projectCompletedAt: milestone2ReqDto.projectCompletedAt,
                verifiedInstAddress: verfiy
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async milestone3Req(files, milestone3ReqDto: Milestone3ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone3Req';
            file.link_id = milestone3ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone3ReqDto.milestone3ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }
            this.savenotification("Milestone Request","Milestone 3 - Amount : "+amount,process.env.Notificationpath+milestone3ReqDto.loan_id)
            await this.installingInfoRepository.update({loan_id: milestone3ReqDto.loan_id},{
                milestone3ReqAmount: amount,
                milestone3signature:milestone3ReqDto.signature,
                status:InstallingStatusFlags.milestone3Completed
            })
            await this.filesRepository.save(filedata);
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async getProjectDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['systemInfoVerified'] = await this.systemInfoRepository.findOne({select:['createdat'], where:{loan_id:id}})
            data['projectDocuments'] = await entityManager.query(`select services, originalname, filename, "createdat" from files where link_id = '${id}' and services in ('installer/fileUpload','installer/milestone1Req','installer/milestone2Req','installer/milestone3Req') and delete_flag = 'N' order by "createdat" asc `)
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
    
    async approveApplication(id){
        try{            
            await this.installingInfoRepository.update({loan_id: id},{
                status: InstallingStatusFlags.projectCompleted,
                approvedAt: new Date()
            })
            return {"statusCode": 200};            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 

    async getFileUploaded(id){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['fileUploadedDetails'] = await entityManager.query("select * from files where link_id='"+id+"' and services='installer/fileUpload'")
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getSystemInfo(id){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['systemInfoDetails'] = await entityManager.query("select * from systeminfo where user_id='"+id)
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async deleteFileUploaded(fileId){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['fileUploadedDetails'] = await entityManager.query("delete from files where id='"+fileId+"'")
            return {"statusCode": 200};            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }


    async savenotification(title,msg, link){
        let noti = new Notification()
        noti.title = title;
        noti.message = msg;
        noti.link = link;
        await this.notificationRepository.save(noti)
    }

    async installInfo(id){
        try{           
            let data = {}
            data['customerDetails'] = await this.customerRepository.findOne({select:['ref_no','loan_id'],where:{loan_id: id}});
            //data['ownershipFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/fileUpload', delete_flag:'N'}});
            data['systemInfo'] = await this.systemInfoRepository.findOne({where:{loan_id: id}});
            data['installingInfo'] = await this.installingInfoRepository.findOne({where:{loan_id: id}});
            data['milestone1ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone1Req', delete_flag:'N'}});
            data['milestone2ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone2Req', delete_flag:'N'}});
            data['milestone3ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone3Req', delete_flag:'N'}});
            
            const entityManager = getManager();
            data['ownershipFiles'] = await entityManager.query(`select * from files where link_id = '${id}' and delete_flag='N' and ( services= 'installer/fileUpload' or "documenttype" = 'Proof of Ownership' )`)
            data['Milestone1Comments'] = await entityManager
                .query(`select  
                            t."comments" ,
                            r."name" as role, 
                            t2."firstname" , 
                            t2."lastname" ,
                            t."createdat" 
                        from comments t 
                        join user t2 on t2.id=t.user_id 
                        join roles r on t2.role = r.id
                        where t.loan_id = '${id}' 
                            and (t."commentType" = 'Milestone1CommentByAdmin'
                            or t."commentType" = 'Milestone1CommentByInstaller')
                        order by t."createdat" desc`
                );
            data['Milestone2Comments'] = await entityManager
                .query(`select  
                            t."comments" ,
                            r."name" as role, 
                            t2."firstname" , 
                            t2."lastname" ,
                            t."createdat" 
                        from comments t 
                        join user t2 on t2.id=t.user_id 
                        join roles r on t2.role = r.id
                        where t.loan_id = '${id}' 
                        and (t."commentType" = 'Milestone2CommentByAdmin'
                        or t."commentType" = 'Milestone2CommentByInstaller')
                        order by t."createdat" desc`
                );  
            data['Milestone3Comments'] = await entityManager
                .query(`select  
                            t."comments" ,
                            r."name" as role, 
                            t2."firstname" , 
                            t2."lastname" ,
                            t."createdat" 
                        from comments t 
                        join user t2 on t2.id=t.user_id 
                        join roles r on t2.role = r.id
                        where t.loan_id = '${id}' 
                        and (t."commentType" = 'Milestone3CommentByAdmin'
                        or t."commentType" = 'Milestone3CommentByInstaller')
                        order by t."createdat" desc`
                ); 
            data['Milestone1Transactions'] = await entityManager
                .query(`select 
                        CONCAT ('LON_',t2.ref_no) as loan_id, 
                        t."transactionid", 
                        t.accountmethod, 
                        t."message", 
                        t."status", 
                        t.amount, 
                        t."createdat" 
                    from transaction t 
                    join loan t2 on t2.id=t.loan_id 
                    where t.loan_id = '${id}' 
                    and t.payment='Milestone1' 
                    order by "createdat" desc`
                );  
                
            data['Milestone2Transactions'] = await entityManager
                .query(`select 
                        CONCAT ('LON_',t2.ref_no) as loan_id, 
                        t."transactionid", 
                        t.accountmethod, 
                        t."message", 
                        t."status", 
                        t.amount, 
                        t."createdat" 
                    from transaction t 
                    join loan t2 on t2.id=t.loan_id 
                    where t.loan_id = '${id}' 
                    and t.payment='Milestone2' 
                    order by "createdat" desc`
                );   

            data['Milestone3Transactions'] = await entityManager
                .query(`select 
                        CONCAT ('LON_',t2.ref_no) as loan_id, 
                        t."transactionid", 
                        t.accountmethod, 
                        t."message", 
                        t."status", 
                        t.amount, 
                        t."createdat" 
                    from transaction t 
                    join loan t2 on t2.id=t.loan_id 
                    where t.loan_id = '${id}' 
                    and t.payment='Milestone3' 
                    order by "createdat" desc`
                );   
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async addComment(addCommentDto:AddCommentDto){
        try{
            if (addCommentDto.comments.trim().length == 0) {
                return { "statusCode": 400, "message": ["comments should not be empty"], "error": "Bad Request" }
            }
            const entityManager = getManager();
            let email = await entityManager.query(`
            select STRING_AGG (distinct t3.email, ', ') as email from portal t 
join rolesmaster t2 on t.id = t2.portal_id 
join user t3 on t3."role" = t2.role_id 
where t."name" = 'admin'
and t2.delete_flag = 'N'
and t3.active_flag = 'Y'
and t3.delete_flag = 'N'
group by t2.portal_id 
            `);
            if(email.length>0){
                email = email[0]['email']
            }
            let subject = addCommentDto.commentType.split('CommentByInstaller')[0]+' Comment By Installer';
            let ref_no = await entityManager.query(`select CONCAT ('LON_',ref_no) as ref_no from loan where id = '${addCommentDto.loan_id}'`);
            if(ref_no.length>0){
                subject = subject+` (${ref_no[0]['ref_no']})`;
            }
            let comment =  new Comments();
            comment.commentType = addCommentDto.commentType;
            comment.comments = addCommentDto.comments;
            comment.loan_id = addCommentDto.loan_id;
            comment.user_id = addCommentDto.user_id;
            await this.commentsRepository.save(comment)
            this.mailService.comments(email,subject,addCommentDto.comments)
            return {"statusCode": 200}
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }
}
