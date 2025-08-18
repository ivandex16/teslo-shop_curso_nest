import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  // Logger para registrar información y errores
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Inyección del repositorio de productos
    @InjectRepository(Product)
    private readonly producRepository: Repository<Product>,

    // Inyección del repositorio de imágenes de productos
    @InjectRepository(ProductImage)
    private readonly producImageRepository: Repository<ProductImage>,

    // Inyección de la fuente de datos para transacciones avanzadas
    private readonly dataSource: DataSource,
  ) {}

  // Crear un nuevo producto con imágenes
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // Crear la entidad producto y asociar imágenes
      const product = this.producRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.producImageRepository.create({ url: image }),
        ),
      });
      // Guardar el producto en la base de datos
      await this.producRepository.save(product);
      // Retornar el producto creado junto con las imágenes
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Obtener todos los productos con paginación
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    // Buscar productos con sus imágenes relacionadas
    const productos = await this.producRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    // Formatear la respuesta para mostrar solo las URLs de las imágenes
    return productos.map(({ images, ...rest }) => ({
      ...rest,
      images: images?.map((img) => img.url),
    }));
  }

  // Buscar un producto por UUID, título o slug
  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      // Buscar por UUID
      product = await this.producRepository.findOneBy({ id: term });
    } else {
      // Buscar por título o slug (ignorando mayúsculas/minúsculas)
      const queryBuilder = this.producRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();

      if (!product) {
        throw new BadRequestException(`Product with  ${term} not found`);
      }
    }
    return product;
  }

  // Buscar un producto y devolverlo en formato plano (solo URLs de imágenes)
  async findOnePlain(term: string) {
    const product = await this.findOne(term);
    if (!product) {
      throw new BadRequestException(`Product with ${term} not found`);
    }
    const { images = [], ...rest } = product;

    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Extrae las imágenes del DTO de actualización, el resto de los campos se almacenan en 'toUpdate'
    const { images, ...toUpdate } = updateProductDto;

    // Busca el producto por id y prepara la entidad para ser actualizada
    const product = await this.producRepository.preload({
      id,
      ...toUpdate,
    });

    // Si no se encuentra el producto, lanza una excepción de "Bad Request"
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }

    // Crea un query runner para manejar la transacción manualmente
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Si se proporcionan imágenes, elimina las imágenes actuales asociadas al producto
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Asocia las nuevas imágenes al producto
        product.images = images.map((image) =>
          this.producImageRepository.create({ url: image }),
        );
      } else {
        // Si no se proporcionan imágenes, no se modifica el arreglo de imágenes
        // product.images = [];
      }

      // Guarda el producto actualizado dentro de la transacción
      await queryRunner.manager.save(product);

      // Confirma la transacción y libera el query runner
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // Devuelve el producto actualizado en formato plano
      return this.findOnePlain(id);
    } catch (error) {
      // Si ocurre un error, revierte la transacción y libera el query runner
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    // Busca el producto por id
    const product = await this.findOne(id);

    // Si no existe, lanza una excepción
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    // Elimina el producto de la base de datos
    return await this.producRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    // Maneja errores de clave duplicada (código 23505 de Postgres)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    // Registra el error y lanza una excepción genérica de servidor
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check de server logs!',
    );
  }

  async deleteAllProducts() {
    // Crea un query builder para eliminar todos los productos
    const query = this.producRepository.createQueryBuilder('product');
    try {
      // Ejecuta la eliminación
      return await query.delete().where({}).execute();
    } catch (error) {
      // Maneja cualquier excepción de base de datos
      this.handleDBExceptions(error);
    }
  }
}
