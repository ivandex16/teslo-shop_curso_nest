import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), // Importamos el módulo TypeOrmModule y le decimos que queremos usar la entidad Product
  ],
  exports: [ProductsService, TypeOrmModule], // Exportamos el servicio y el módulo TypeOrmModule para que puedan ser usados en otros módulos
})
export class ProductsModule {}
