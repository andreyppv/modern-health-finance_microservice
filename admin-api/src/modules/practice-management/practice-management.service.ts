import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { PracticeRepository } from 'src/repository/practice.repository';
import { PracticeEntity } from 'src/entities/practice.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { FilesEntity } from 'src/entities/files.entity';
import { getManager } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserEntity } from 'src/entities/users.entity';
import { UserRepository } from 'src/repository/users.repository';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
@Injectable()
export class PracticeManagementService {
  constructor(
    @InjectRepository(PracticeRepository)
    private readonly practiceRepository: PracticeRepository,
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async getPractice(id: string) {
    try {
      let entityManager = getManager();
      let practice: any = await this.practiceRepository.find({
        where: { id: id },
      });
      // let files = await entityManager.query(`
      //       select * from files where link_id  = '${id}' and (services='practiceMangement/practiceLogo' or services='practiceMangement/practicePoweredByLogo')`);
      // practice[0].files = files;
      return {
        statusCode: 200,
        practice: practice[0],
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async getPracticeByUrl(url: string) {
    const entityManager = getManager(); //console.log('url => ',url);
    try {
      let practice: any = await entityManager.query(
        `select ref_no, id, "contactname" ,email , "practicename", "practiceurl", "practicehomeurl", "locationname",city ,"statecode" ,"practiceurl" from practice t where t."practiceurl" = '${url}' `,
      );
      // await this.practiceRepository.find({
      //   where: { practiceUrl: url },
      // });
      // let practiceLogo = await entityManager.query(
      //   `select filename from files where link_id = '${practice[0].id}' and delete_flag='N' and services='practiceMangement/practiceLogo'`,
      // );
      // let practicePoweredByLogo = await entityManager.query(
      //   `select originalname,filename from files where link_id = '${practice[0].id}' and delete_flag='N' and services='practiceMangement/practicePoweredByLogo'`,
      // );
      return {
        statusCode: 200,
        practice: practice[0],
        // practiceLogo,
        // practicePoweredByLogo,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }
  async getallPractice() {
    try {
      let entityManager = getManager();
      // let allPractice: any = await entityManager.query(
      //   `select ref_no, id, "contactname" ,email , "practicename", "practiceurl", "practicehomeurl", "locationname",city ,"statecode" ,"practiceurl" from practice `,
      // );

      let allPractice: any = await entityManager.query(
        `select  _id, "contactname" ,practiceemail , "practicename", "practiceurl", "practicehome", "locationname",city ,"statecode" ,"practiceurl" from practicemanagement `,
      );
      //let allPractice: any = await this.practiceRepository.find();
      return {
        statusCode: 200,
        allPractice,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async getPracticeName() {
    try {
      let entityManager = getManager();
      // let allPractice = await entityManager.query(
      //   ` select id, "practicename"  from practice t where practicename !='Null' `,
      // );
      let allPractice = await entityManager.query(
        ` select _id, "practicename"  from practicemanagement t where practicename !='Null' `,
      );

      return {
        statusCode: 200,
        allPractice,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async edit(createPracticeDto: CreatePracticeDto, id: string) {
    try {
      let saveData: any = {
        contactname: createPracticeDto.contactName,
        email: createPracticeDto.email,
        practicename: createPracticeDto.practiceName,
        practiceurl: createPracticeDto.practiceUrl,
        practicehomeurl: createPracticeDto.practiceHomeUrl,
        practicelinktoform: createPracticeDto.practiceLinkToForm,
        locationname: createPracticeDto.locationName,
        streetaddress: createPracticeDto.streetaddress,
        city: createPracticeDto.city,
        statecode: createPracticeDto.stateCode,
        zipcode: createPracticeDto.zipcode,
        phonenumber: createPracticeDto.phoneNumber,
        practicesettings: createPracticeDto.practiceSettings,
        practicemaincolor: createPracticeDto.practiceMainColor,
        practicesecondarycolor: createPracticeDto.pacticeSecondaryColor,
      };
      if (createPracticeDto.practicelogo) {
        saveData.practicelogo = createPracticeDto.practicelogo;
      }
      if (createPracticeDto.practicepoweredbylogo) {
        saveData.practicepoweredbylogo =
          createPracticeDto.practicepoweredbylogo;
      }
      await this.practiceRepository.update({ id: id }, saveData);
      // }
      return {
        statusCode: 200,
        message: 'Data Updated Successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async create(createPracticeDto: CreatePracticeDto) {
    try {
      let entityManager = getManager();
      let email = await this.practiceRepository.find({
        where: { email: createPracticeDto.email },
      });

      let practice = await this.practiceRepository.find({
        where: {
          practiceurl: createPracticeDto.practiceUrl,
        },
      });
      if (email.length == 0 && practice.length == 0) {
        let practiceEntity = new PracticeEntity();
        practiceEntity.contactname = createPracticeDto.contactName;
        practiceEntity.email = createPracticeDto.email;
        practiceEntity.practicename = createPracticeDto.practiceName;
        practiceEntity.practiceurl = createPracticeDto.practiceUrl;
        practiceEntity.practicehomeurl = createPracticeDto.practiceHomeUrl;
        practiceEntity.practicelinktoform =
          createPracticeDto.practiceLinkToForm;
        practiceEntity.locationname = createPracticeDto.locationName;
        practiceEntity.streetaddress = createPracticeDto.streetaddress;
        practiceEntity.city = createPracticeDto.city;
        practiceEntity.statecode = createPracticeDto.stateCode;
        practiceEntity.zipcode = createPracticeDto.zipcode;
        practiceEntity.phonenumber = createPracticeDto.phoneNumber;
        practiceEntity.practicesettings = createPracticeDto.practiceSettings;
        practiceEntity.practicemaincolor = createPracticeDto.practiceMainColor;
        practiceEntity.practicesecondarycolor =
          createPracticeDto.pacticeSecondaryColor;
        practiceEntity.practicelogo = createPracticeDto.practicelogo;
        practiceEntity.practicepoweredbylogo =
          createPracticeDto.practicepoweredbylogo;

        let practice = await this.practiceRepository.save(practiceEntity);

        await this.mailService.createPractice(
          practiceEntity.email,
          `${process.env.UI_URL}${practiceEntity.practiceurl}`,
          practiceEntity.practicename,
        );
        return {
          statusCode: 200,
          message: 'Practice Created Successfully',
          practiceDetails: practice,
        };
      } else {
        return {
          statusCode: 500,
          message: 'Practice Already Exists',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      console.log('createAdminDto', createAdminDto);
      let user = await this.userRepository.find({
        where: { email: createAdminDto.email },
      });
      let practice = await this.practiceRepository.find({
        where: { id: createAdminDto.practiceid },
      });

      if (practice.length > 0) {
        let entityManager = getManager();
        let test = await entityManager.query(`select * from roles t
   where name = '${createAdminDto.role}'
  `);
        let userEntity = new UserEntity();
        userEntity.email = createAdminDto.email.trim();
        console.log('test', test);
        userEntity.role = test[0].id; //createAdminDto.role
        userEntity.firstname = createAdminDto.firstname.trim();
        userEntity.lastname = createAdminDto.lastname.trim();
        // userEntity.location = createAdminDto.location.trim();
        // userEntity.mobile = createAdminDto.mobile.trim();
        // userEntity.active_flag =
        //   createAdminDto.status == '1' ? Flags.Y : Flags.N;
        // userEntity.maininstallerid = createAdminDto.practiceid.trim();

        let length = 8,
          charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
          password += charset.charAt(Math.floor(Math.random() * n));
        }
        console.log(password);
        userEntity.salt = await bcrypt.genSalt();
        userEntity.password = await bcrypt.hash(password, userEntity.salt);
        console.log('id', createAdminDto.id);
        if (createAdminDto.id != '') {
          await this.userRepository.update(
            { _id: createAdminDto.id },
            userEntity,
          );
        } else {
          await this.userRepository.save(userEntity);
        }
        this.mailService.add(
          userEntity.email,
          password,
          `${process.env.UI_URL}admin/login`,
        );

        return {
          statusCode: 200,
          message: 'Practice Admin Created',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Invalid Practice',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async getAllPracticeAdmin() {
    try {
      let entityManager = getManager();
      // let practiceAdmins = await entityManager.query(`
      //   select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , t3."name"  as role, t1.active_flag as status, t1."location" as locationname
      //       from public.user t1 join practice t2 on t1."maininstallerid" = t2.id join roles t3 on t1."role" = t3.id 
      // `);

      let practiceAdmins = await entityManager.query(`
          SELECT
            t1._id AS ID,
            t1.email,
            t1.firstname,
            t1.lastname,
            t1.phonenumber AS mobile,
            t1.createdat,
            t1.role,
            t2.practicename
          FROM
            practiceuser t1
            JOIN practicemanagement t2 ON t1.practicemanagement = t2._id
      `)

      return {
        statusCode: 200,
        data: practiceAdmins,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }
  async geteditpracticeadmin(id: string) {
    try {
      let entityManager = getManager();
      let practiceAdmins = await entityManager.query(`select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , t3."name" as role
from user t1 join practice t2 on t1."maininstallerid" = t2.id join roles t3 on t1."role" = t3.id
where t1.id = '${id}' and t1."maininstallerid" is not null`);
      // console.log('Edit data => ', practiceAdmins);

      return {
        statusCode: 200,
        data: practiceAdmins,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

  async getPracticeAdminById(id) {
    try {
      let entityManager = getManager();
      let user = await entityManager.query(`
            select t1.id, t1.email, t1."firstname" ,t1."lastname" ,t1.mobile, t1."createdat" , t2."practicename" , 
            t2.id as practiceid, t1.active_flag, t3."name"  as role, t3.id as roleid, t1."location" , t1.mobile 
            from public.user t1 join practice t2 on t1."mainistallerid" = t2.id join roles t3 on t1."role" = t3.id 
            where t1."maininstallerid" is not null and t1.id='${id} '
            `);
      if (user.length > 0) {
        return {
          statusCode: 200,
          data: user,
          message: 'Data Updated Successfully',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Invalid Practice Admin',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }
  async editPracticeAdmin(updateAdminDto: UpdateAdminDto, id: string) {
    try {
      let user = await this.userRepository.find({ where: { id: id } });
      if (user.length > 0) {
        let practice = await this.userRepository.update(
          { _id: id },
          {
            email: updateAdminDto.email,
            firstname: updateAdminDto.firstname,
            lastname: updateAdminDto.lastname,
            // location: updateAdminDto.location,
            // mobile: updateAdminDto.mobile,
            // active_flag: updateAdminDto.status == 'Y' ? Flags.Y : Flags.N,
          },
        );

        return {
          statusCode: 200,
          message: 'Data Updated Successfully',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Invalid Practice Admin',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }
}
