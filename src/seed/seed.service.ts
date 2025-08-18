import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {
    // Aquí podrías inicializar cualquier cosa necesaria para el servicio
  }
  async runSeed() {
    await this.insertNewProducts();
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertpromises: Promise<any>[] = [];

    products.forEach((product) => {
      insertpromises.push(this.productService.create(product));
    });

    await Promise.all(insertpromises);
    return true;
  }
}
