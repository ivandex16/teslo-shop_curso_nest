import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userReposistory: Repository<User>,
  ) {
    // Aquí podrías inicializar cualquier cosa necesaria para el servicio
  }
  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);

    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userReposistory.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers(): Promise<User> {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userReposistory.create(user));
    });

    const dbUsers = await this.userReposistory.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertpromises: Promise<any>[] = [];

    products.forEach((product) => {
      insertpromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertpromises);
    return true;
  }
}
