import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

// El decorador @Injectable() indica que esta clase puede ser inyectada como dependencia en otros componentes de NestJS.
// Permite que el servicio sea gestionado por el sistema de inyección de dependencias de Nest.
@Injectable()
export class FilesService {
  // Método que retorna la ruta absoluta de una imagen de producto almacenada en el servidor
  getStaticProductImage(imageName: string) {
    // Une varias partes de una ruta de archivos en una sola ruta absoluta.
    // __dirname es el directorio actual del archivo files.service.ts
    // '../../static/products' sube dos niveles y entra a la carpeta static/products
    // imageName es el nombre del archivo de imagen que se quiere buscar

    // Construye la ruta absoluta al archivo de imagen usando el nombre recibido
    const path = join(__dirname, '../../static/products', imageName);

    // Verifica si el archivo existe en el sistema de archivos
    if (!existsSync(path)) {
      // Si no existe, lanza una excepción indicando que no se encontró la imagen
      // BadRequestException es un decorador de excepción de NestJS que retorna un error 400 al cliente
      throw new BadRequestException(`No product found with image ${imageName}`);
    }

    // Si el archivo existe, retorna la ruta absoluta
    return path;
  }
}
