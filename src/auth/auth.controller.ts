import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { UpdateAuthDto, CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { RoleProtected, RawHeaders, Auth, GetUser } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testtingPrivateRoute(
    //@Req() request: Express.Request
    @GetUser() user: User, // Aquí puedes definir el tipo de usuario si tienes un DTO o interfaz
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: string[],
  ) {
    console.log({ user });
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      userEmail, 
      rawHeaders,
      headers,
    };
  }



  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola mundo private 2',
      user,
    };
  }


  @Get('private3')
 @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola mundo private 3',
      user,
    };
  }
}
