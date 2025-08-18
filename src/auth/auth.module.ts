import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

// Define el módulo de autenticación
@Module({
  controllers: [AuthController], // Controladores que manejan las rutas de autenticación
  providers: [AuthService, JwtStrategy], // Servicios que contienen la lógica de negocio de autenticación
  imports: [
    ConfigModule, // Importa el módulo de configuración para acceder a las variables de entorno

    TypeOrmModule.forFeature([User]), // Importa el repositorio de la entidad User para usarlo en el servicio

    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura Passport con la estrategia JWT por defecto

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('JWT_SECRET:', configService.get('JWT_SECRET'));
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        // Configura el módulo JWT de forma asíncrona usando ConfigService para obtener las variables de entorno
        // Esto permite que las variables de entorno se carguen correctamente antes de inicializar el módulo

        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }, // Configura las opciones de firma del JWT
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule], // Exporta TypeOrmModule para que otros módulos puedan usar el repositorio de User
})
export class AuthModule {}
