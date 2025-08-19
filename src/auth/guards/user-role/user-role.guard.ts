import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector, // Import Reflector to access metadata
  ) {}


  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

   
    const validRoles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log({ validRoles });


    //throw new BadRequestException('UserRoleGuard - No tienes permisos para acceder a este recurso');


    return true;
  }
}
