import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Addroles } from './dto/add-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
@Injectable()
export class RolesService {
  // constructor(
  //   @InjectRepository(RolesRepository)
  //   private readonly rolesRepository: RolesRepository,
  // ) {}
  async addRoles(addRoles) {
    // try {
    //   const roles = new Roles();
    //   if (addRoles.name.trim().length == 0) {
    //     return {
    //       statusCode: 400,
    //       message: 'Name should not be empty',
    //       error: 'Bad Request',
    //     };
    //   } else {
    //     const count = await this.rolesRepository.count({
    //       select: ['id'],
    //       where: {
    //         delete_flag: 'N',
    //         name: addRoles.name.toLocaleLowerCase(),
    //       },
    //     });
    //     if (count == 0) {
    //       roles.name = addRoles.name.toLocaleLowerCase();
    //       await this.rolesRepository.save(roles);
    //     }
    //     return { statusCode: 200, data: 'Roles will be added successfully' };
    //   }
    // } catch (error) {
    //   return {
    //     statusCode: 500,
    //     message: [new InternalServerErrorException(error)['response']['name']],
    //     error: 'Bad Request',
    //   };
    // }
  }

  async updateRoles(updateRoles) {
    // try {
    //   if (updateRoles.name.trim().length == 0) {
    //     return {
    //       statusCode: 400,
    //       message: 'Name should not be empty',
    //       error: 'Bad Request',
    //     };
    //   }
    //   await this.rolesRepository.update(
    //     { id: updateRoles.id, edit_flag: 'Y' },
    //     { name: updateRoles.name.toLocaleLowerCase() },
    //   );
    //   return { statusCode: 200, data: 'Roles will be updated successfully' };
    // } catch (error) {
    //   return {
    //     statusCode: 500,
    //     message: [new InternalServerErrorException(error)['response']['name']],
    //     error: 'Bad Request',
    //   };
    // }
  }

  async deleteRoles(id) {
    // try {
    //   await this.rolesRepository.update(
    //     { id: id, edit_flag: 'Y' },
    //     { delete_flag: 'Y' },
    //   );
    //   return { statusCode: 200 };
    // } catch (error) {
    //   return {
    //     statusCode: 500,
    //     message: [new InternalServerErrorException(error)['response']['name']],
    //     error: 'Bad Request',
    //   };
    // }
  }

  async getRoles() {
    const entityManager = getManager();
    const rawData = await entityManager.query('select _id as id,rolename as name, 0 as edit_flag from roles where isdeleted=false order by _id');
    console.log(rawData)
    return {statusCode : 200, data : rawData}
  }

  async addPermission(addPermission) {
    // try {
    //   const count = await this.rolesRepository.count({
    //     select: ['id'],
    //     where: {
    //       delete_flag: 'N',
    //       edit_flag: 'Y',
    //       id: addPermission.id,
    //     },
    //   });
    //   if (count == 1) {
    //     // await this.rolesmasterRepository.update(
    //     //   { role_id: addPermission.id },
    //     //   { delete_flag: Flags.Y },
    //     // );
    //     // const roleMasterList = [];
    //     // for (let i = 0; i < addPermission.ids.length; i++) {
    //     //   // const roleMaster = new Rolesmaster();
    //     //   // const rolesmaster = new Rolesmaster();
    //     //   // rolesmaster.role_id = addPermission.id;
    //     //   // rolesmaster.portal_id = addPermission.ids[i].portal_id;
    //     //   // rolesmaster.pages_id = addPermission.ids[i].pages_id;
    //     //   // rolesmaster.pagetabs_id = addPermission.ids[i].pagetabs_id;
    //     //   // roleMasterList.push(rolesmaster);
    //     // }
    //     // if (roleMasterList.length > 0) {
    //     //   await this.rolesmasterRepository.save(roleMasterList);
    //     // }
    //   }
    //   return { statusCode: 200, data: 'Permission will be added successfully' };
    // } catch (error) {
    //   return {
    //     statusCode: 500,
    //     message: [new InternalServerErrorException(error)['response']['name']],
    //     error: 'Bad Request',
    //   };
    // }
  }

  async checkPermission(id) {
    // try {
    //   const roleDetails = await this.rolesRepository.find({
    //     select: ['id', 'name'],
    //     where: { edit_flag: 'Y', delete_flag: 'N', id: id },
    //   });
    //   return {
    //     statusCode: 200,
    //     data: roleDetails,
    //   };
    // } catch (error) {
    //   return {
    //     statusCode: 500,
    //     message: [new InternalServerErrorException(error)['response']['name']],
    //     error: 'Bad Request',
    //   };
    // }
  }

  async getmenulist(id) {
    try {
      const entityManager = getManager();
      const list = await entityManager.query(`select t.id as portal_id, t2.id as pages_id, t3.id as pagetabs_id, t3.id as id, t."name" as portal_name, t2."name" as pagesname, t3."name" as pagestabsname, t3."name" as "itemName" from portal t 
        join pages t2 on t2.portal_id = t.id
        left join pagetabs t3 on t3.pages_id = t2.id
        where t.delete_flag = 'N' 
        and t2.delete_flag = 'N' 
        and t3.delete_flag = 'N'
        and t.active_flag = 'Y' 
        and t2.active_flag = 'Y' 
        and t3.active_flag = 'Y'`);
      const select = await entityManager.query(`select t.id as portal_id, t2.id as pages_id, t3.id as pagetabs_id, t3.id as id, t."name" as portal_name, t2."name" as pagesname, t3."name" as pagestabsname, t3."name" as "itemName" from portal t 
        join pages t2 on t2.portal_id = t.id
        left join pagetabs t3 on t3.pages_id = t2.id
        join rolesmaster t4 on t4.pagetabs_id = t3.id
        where t.delete_flag = 'N' 
        and t2.delete_flag = 'N' 
        and t3.delete_flag = 'N'
        and t.active_flag = 'Y' 
        and t2.active_flag = 'Y' 
        and t3.active_flag = 'Y'
        and t4.delete_flag = 'N'
        and t4.role_id = ${id}`);
      return { statusCode: 200, data: { list: list, select: select } };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getAdminPortalRoles() {
    try {
      const entityManager = getManager();
      // const list = await entityManager.query(`select distinct 
      //               r.id, 
      //               r.name
      //           from roles r
      //           join rolesmaster rm on r.id = rm.role_id 
      //           join portal p on p.id = rm.portal_id 
      //           where 
      //               p.name = 'admin'
      //           and r.delete_flag ='N' 
      //           order by r.id asc
      //       `);
      return { statusCode: 200, data: [] };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getCustomerPortalRoles() {
    try {
      const entityManager = getManager();
      const list = await entityManager.query(`select distinct 
                    r.id
                from roles r
                join rolesmaster rm on r.id = rm.role_id 
                join portal p on p.id = rm.portal_id 
                where 
                    p.name = 'customer'
                and r.delete_flag ='N' 
                order by r.id asc
            `);
      return list[0].id;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
}
