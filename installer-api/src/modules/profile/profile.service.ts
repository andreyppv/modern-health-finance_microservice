import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesEntity, Flags } from 'src/entities/files.entity';
import { Installer } from 'src/entities/installer.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserRepository } from 'src/repository/users.repository';
import { getManager } from 'typeorm';
import { EditProfileDto, EditSubInstallerDto } from './dto/profile.dto';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
        @InjectRepository(InstallerRepository) private readonly installerRepository: InstallerRepository,
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
        @InjectRepository(UserBankAccountRepository) private readonly userBankAccountRepository: UserBankAccountRepository,
        @InjectRepository(UserDebitCardRepository) private readonly userDebitCardRepository: UserDebitCardRepository,
    ){}

    async editProfile(editProfileDto: EditProfileDto){        
        try{
            let data={}
            data['installerDetails'] = await this.installerRepository.findOne({where:{user_id:editProfileDto.user_id}});
            
            if(!data['installerDetails']){
                let installer = new Installer();

                installer.user_id = editProfileDto.user_id,
                installer.firstname = editProfileDto.firstname
                installer.lastname = editProfileDto.lastname
                // installer.birthday = editProfileDto.birthday
                installer.email = editProfileDto.email
                installer.phone = editProfileDto.phone
                installer.streetaddress = editProfileDto.streetaddress
                installer.unit = editProfileDto.unit
                installer.city = editProfileDto.city
                installer.state = editProfileDto.state
                installer.zipcode = editProfileDto.zipcode
                installer.offermodel = editProfileDto.offermodel
                
                await this.installerRepository.save(installer);
                return { "statusCode": 200}
            }else{
                await this.installerRepository.update({user_id:editProfileDto.user_id},{
                    firstname : editProfileDto.firstname,
                    lastname : editProfileDto.lastname,
                    // birthday : editProfileDto.birthday,
                    email : editProfileDto.email,
                    phone : editProfileDto.phone,
                    streetaddress : editProfileDto.streetaddress,
                    unit : editProfileDto.unit,
                    city : editProfileDto.city,
                    state : editProfileDto.state,
                    zipcode : editProfileDto.zipcode,
                    offermodel:editProfileDto.offermodel
                });                
                return { "statusCode": 200, "message":['Profile details saved successfully']}
            }
        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async editSubInstaller(editSubInstallerDto:EditSubInstallerDto){        
        try{  
            await this.userRepository.update({id:editSubInstallerDto.user_id},{
                firstname : editSubInstallerDto.firstname,
                lastname : editSubInstallerDto.lastname,
            });                
            return { "statusCode": 200, "message":['Profile details saved successfully']}
            
        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async saveProfileImage(id, files) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/profileImage';
            file.link_id = id;
            filedata.push(file)
        }
        try{
            let data={}
            data['checkProfileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage', delete_flag:Flags.N}});
            if(data['checkProfileImage']){
                await this.filesRepository.update({link_id:id, services:'installer/profileImage'},{
                    delete_flag: Flags.Y
                });
            }            
            await this.filesRepository.save(filedata);
            return { "statusCode": 200, data: files[0].filename}
        } catch (error) {
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async removeProfileImage(id) {        
        try{
            let data={}
            data['checkProfileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage', delete_flag:Flags.N}});
            if(data['checkProfileImage']){
                await this.filesRepository.update({link_id:id, services:'installer/profileImage'},{
                    delete_flag: Flags.Y
                });
            } 
            return { "statusCode": 200}
        } catch (error) {
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async getProfileDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}         
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileDetails'] = await this.installerRepository.findOne({where:{user_id:id}});
            if(data['profileDetails']==undefined){
                data['profileDetails'] = await this.userRepository.findOne({where:{id:id}});
            }
            data['profileStatistics'] = await entityManager.query("select status, count(status) as statusCount from installinginfo ii where ii.user_id='"+id+"' group by status")          
            data['bankDetails'] = await this.userBankAccountRepository.find({where:{user_id:id, delete_flag: 'N'}});
            data['cardDetails'] = await this.userDebitCardRepository.find({where:{user_id:id, delete_flag: 'N'}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            console.log('err', error);
            
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
    
    async getProfileSettings(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileSettings'] = await this.installerRepository.findOne({where:{user_id:id}});            
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 

    async getSubInstallerProfile(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileSettings'] = await this.userRepository.findOne({where:{id:id}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
}
