import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
/* AuthService provides authentication-related operations such as user creation and login.*/
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   *
   * @param createUserDto - Objeto que contiene los datos necesarios para crear un usuario, incluyendo la contraseña.
   *
   * @returns Un objeto con los datos del usuario creado, excluyendo la contraseña.
   *
   * @throws Lanza y maneja errores relacionados con la base de datos a través del método `handleDBError`.
   *
   * @remarks
   * - Extrae la contraseña del DTO y la encripta usando bcrypt antes de guardar el usuario.
   * - Utiliza el repositorio de usuarios para crear y guardar la entidad en la base de datos.
   * - El objeto retornado no incluye la contraseña por razones de seguridad.
   * - Si ocurre un error durante el proceso, se registra en consola y se maneja adecuadamente.
   */
  async create(createUserDto: CreateUserDto) {
    try {
      // Extrae la contraseña y el resto de los datos del DTO recibido
      const { password, ...userData } = createUserDto;

      // Crea una nueva instancia de usuario, hasheando la contraseña antes de guardar
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10), // Hashea la contraseña con un salt de 10 rondas
      });

      // Guarda el usuario en la base de datos
      await this.userRepository.save(user);

      // Extrae la propiedad password del usuario guardado y retorna el resto de los datos (sin la contraseña)
      // Esto es para no exponer la contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = user;
      return {
        userWithoutPassword,
        token: this.getJwtToken({ id: user.id }), // Genera un token JWT para el usuario creado
      };
    } catch (error) {
      // Si ocurre un error, lo muestra en consola y delega el manejo a handleDBError
      console.error('Error creating user:', error);
      this.handleDBError(error);
    }
  }

  /**
 
 *
 * @method login
 * Autentica a un usuario usando sus credenciales de correo electrónico y contraseña.
 *
 * Detalles de la función:
 * - Extrae el correo electrónico y la contraseña del objeto `loginUserDto`.
 * - Busca un usuario en la base de datos cuyo correo electrónico coincida.
 *   - Utiliza `findOne` con la opción `select` para obtener solo el correo y la contraseña.
 * - Si el usuario no existe, lanza una excepción `UnauthorizedException` indicando que las credenciales no son válidas (correo).
 * - Si el usuario existe, compara la contraseña proporcionada con la almacenada en la base de datos usando `bcrypt.compareSync`.
 *   - Si la comparación falla, lanza una excepción `UnauthorizedException` indicando que las credenciales no son válidas (contraseña).
 * - Si la autenticación es exitosa, retorna el usuario (incluyendo solo el correo y la contraseña).
 *
 * @param loginUserDto - Objeto que contiene el correo electrónico y la contraseña del usuario.
 * @returns El usuario autenticado si las credenciales son válidas.
 * @throws {UnauthorizedException} Si el correo electrónico o la contraseña no son válidos.
 */
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credential are not valid (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credential are not valid (password)');
    }
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleDBError(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.error('Database error:', error);
    throw new BadRequestException('Unexpected error, check logs');
  }
}
