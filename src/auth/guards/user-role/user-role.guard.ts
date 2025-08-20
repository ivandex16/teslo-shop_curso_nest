import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from 'src/auth/decorator/role-protected/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  // El constructor recibe una instancia de Reflector para acceder a metadatos en los controladores o métodos
  constructor(
    private readonly reflector: Reflector, // Importa Reflector para leer los metadatos de los roles
  ) {}

  // Método principal que determina si la petición puede continuar o no
  canActivate(
    context: ExecutionContext, // Contexto de la ejecución actual (petición HTTP, etc.)
  ): boolean | Promise<boolean> | Observable<boolean> {

    // Obtiene los roles válidos definidos como metadato en el handler (método del controlador)
    const validRoles = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    // Si no hay roles definidos, permite el acceso por defecto
    if (!validRoles || validRoles.length === 0) {
      return true; // Acceso permitido si no se requieren roles específicos
    }

    // Obtiene el objeto request de la petición HTTP actual
    const request = context.switchToHttp().getRequest();
    // Extrae el usuario autenticado de la petición
    const user = request.user as User;

    // Si no existe usuario en la petición, lanza una excepción de petición incorrecta
    if (!user) 
      throw new BadRequestException('UserRoleGuard - No tienes permisos para acceder a este recurso');

    // Recorre los roles del usuario autenticado
    for (const role of user.roles) {
      // Si alguno de los roles del usuario está en la lista de roles válidos, permite el acceso
      if (validRoles.includes(role)) {
        return true;
      }
    }

    // Si ningún rol del usuario coincide, lanza una excepción de acceso prohibido
    throw new ForbiddenException(
      `
      User ${user.fullName} - Necesitas uno de estos roles: [${validRoles}] para acceder a este recurso`
    );
  }
}
