import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Importa los decoradores y clases necesarios para la estrategia JWT
@Injectable() // Marca la clase como inyectable para el sistema de dependencias de NestJS
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) // Inyecta el repositorio de usuarios para acceder a la base de datos
    private readonly userRepository: Repository<User>,

    configService: ConfigService, // Inyecta el servicio de configuración para acceder a variables de entorno
  ) {
    // Obtiene la clave secreta JWT desde las variables de entorno
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      // Si no existe la clave secreta, lanza un error
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Llama al constructor de la clase padre PassportStrategy con la configuración necesaria
    super({
      secretOrKey: secret, // Clave secreta para verificar el token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el JWT del header Authorization como Bearer token
    });
  }

  // Método que valida el token JWT y retorna el usuario correspondiente
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload; // Extrae el email del payload del token

    // Busca el usuario en la base de datos usando el email
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      // Si no encuentra el usuario, lanza una excepción de no autorizado
      throw new UnauthorizedException(
        'Token no válido o usuario no encontrado',
      );
    }

    if (!user.isActive) {
      // Si el usuario está inactivo, lanza una excepción de no autorizado
      throw new UnauthorizedException('User is not active, talk to admin');
    }

    return user; // Si todo está bien, retorna el usuario
  }
}
