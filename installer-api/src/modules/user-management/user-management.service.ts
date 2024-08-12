import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity,Flags } from '../../entities/users.entity';
import { UserRepository } from 'src/repository/users.repository';
import { getManager, In } from 'typeorm';
import { AddUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UserManagementService {
    constructor( 
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
        private readonly mailService: MailService
    ) {}

    async addUser(addUserDto:AddUserDto){    
        try {
            let newUser = new UserEntity()           
            newUser.maininstallerid = addUserDto.maininstallerid;
            newUser.firstname = addUserDto.firstname;
            newUser.lastname = addUserDto.lastname;
            newUser.email = addUserDto.email;
            newUser.role = addUserDto.role;

            //check email already exist or not
            const entityManager = getManager();
            const role_list = await entityManager.
                query(`select distinct 
                        r.id
                    from roles r
                    join rolesmaster rm on r.id = rm.role_id 
                    join portal p on p.id = rm.portal_id 
                    where 
                        p.name = 'installer'
                    and r.delete_flag ='N' 
                `)

            if(role_list.length>0){
                let r = []
                for (let i = 0; i < role_list.length; i++) {
                    r.push(role_list[i]['id']);
                }

                let users:any = await this.userRepository.find( {select:["email"], where:{delete_flag:'N', email: newUser.email, role: In(r)}});
                if(users.length>0){
                    return {"statusCode": 400, "message": ["This Email Already Exists"],"error": "Bad Request"}
                }

                var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                password = "";
                for (var i = 0, n = charset.length; i < length; ++i) {
                    password += charset.charAt(Math.floor(Math.random() * n));
                }

                newUser.salt = await bcrypt.genSalt();
                newUser.password = await bcrypt.hash(password, newUser.salt);
                newUser.active_flag = Flags.Y;            
                
                let newUserRes = await this.userRepository.save(newUser);

                let url:any = process.env.InstallerUrl
                url=url+"login"
                this.mailService.add(newUser.email,password,url)

                return {"statusCode": 200, "message": ["User Added Successfully"]};
            }          
                      
        } catch (error) {
          return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getUsers(id){
        const entityManager = getManager();
        try{            
            let usersList = await entityManager.query(`select u.*, r.name as role_name from public.user u join roles r on r.id = u.role where u."maininstallerid"='${id}' and u.delete_flag='N'`)          
            return {"statusCode": 200, usersList:usersList };            
        }catch(error){
            console.log('err', error);
            
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
}
