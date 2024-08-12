import { Injectable, CanActivate, ExecutionContext,HttpException,
  HttpStatus, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

import { jwtConfig } from '../configs/configs.constants';

export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  INSTALLER = 'installer'
}






@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    
  }

  canActivate(context: ExecutionContext): boolean {
    
    const requiredRoles = this.reflector.getAllAndOverride<UsersRole[]>(
      'role',
      [context.getHandler(), context.getClass()],
    );
    
    if (!requiredRoles) {
      return true;
    }


    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }
    const user = this.validateToken(request.headers.authorization);
    return requiredRoles.includes(user.role);

  }

   validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, jwtConfig.secret);

      return decoded;
    } catch (err) {
      const message = 'Token error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}
