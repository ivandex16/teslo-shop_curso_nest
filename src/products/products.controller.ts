import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorator';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

// El decorador @Controller('products') indica que todas las rutas de este controlador comienzan con /products
@Controller('products')
export class ProductsController {
  // Inyecta el servicio de productos mediante el constructor
  constructor(private readonly productsService: ProductsService) {}

  // Maneja la creación de un nuevo producto (POST /products)
  @Post()
  @Auth()
  create(
    @Body() createProductDto: CreateProductDto, // El decorador @Body() extrae el cuerpo de la petición y lo mapea al DTO
    @GetUser() user: User, // El decorador @GetUser() extrae el usuario autenticado de la petición
  ) {
    return this.productsService.create(createProductDto, user);
  }

  // Obtiene todos los productos con paginación (GET /products)
  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    // El decorador @Query() extrae los parámetros de consulta (query params) y los mapea al DTO de paginación
    return this.productsService.findAll(paginationDto);
  }

  // Obtiene un producto por término (puede ser id, slug, etc.) (GET /products/:term)
  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    // El decorador @Param() extrae el parámetro de la ruta llamado 'term'
    return this.productsService.findOnePlain(term);
  }

  // Actualiza un producto por id (PATCH /products/:id)
  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    // El decorador @Param() extrae el parámetro 'id' y lo valida como UUID con ParseUUIDPipe
    @Param('id', new ParseUUIDPipe()) id: string,
    // El decorador @Body() extrae el cuerpo de la petición y lo mapea al DTO de actualización
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User, // El decorador @GetUser() extrae el usuario autenticado de la petición
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  // Elimina un producto por id (DELETE /products/:id)
  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    // El decorador @Param() extrae el parámetro 'id' y lo valida como UUID con ParseUUIDPipe
    return this.productsService.remove(id);
  }
}
