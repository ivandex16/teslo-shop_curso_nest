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

// El decorador @Controller('products') indica que todas las rutas de este controlador comienzan con /products
@Controller('products')
export class ProductsController {
  // Inyecta el servicio de productos mediante el constructor
  constructor(private readonly productsService: ProductsService) {}

  // Maneja la creación de un nuevo producto (POST /products)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    // El decorador @Body() extrae el cuerpo de la petición y lo mapea al DTO
    return this.productsService.create(createProductDto);
  }

  // Obtiene todos los productos con paginación (GET /products)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    // El decorador @Query() extrae los parámetros de consulta (query params) y los mapea al DTO de paginación
    return this.productsService.findAll(paginationDto);
  }

  // Obtiene un producto por término (puede ser id, slug, etc.) (GET /products/:term)
  @Get(':term')
  findOne(@Param('term') term: string) {
    // El decorador @Param() extrae el parámetro de la ruta llamado 'term'
    return this.productsService.findOnePlain(term);
  }

  // Actualiza un producto por id (PATCH /products/:id)
  @Patch(':id')
  update(
    // El decorador @Param() extrae el parámetro 'id' y lo valida como UUID con ParseUUIDPipe
    @Param('id', new ParseUUIDPipe()) id: string,
    // El decorador @Body() extrae el cuerpo de la petición y lo mapea al DTO de actualización
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // Elimina un producto por id (DELETE /products/:id)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    // El decorador @Param() extrae el parámetro 'id' y lo valida como UUID con ParseUUIDPipe
    return this.productsService.remove(id);
  }
}
