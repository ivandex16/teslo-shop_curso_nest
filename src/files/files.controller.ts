import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  // Define el endpoint GET /files/product/:imageName para servir imágenes de productos
  @Get('product/:imageName')
  findproductImage(
    @Res() res: Response, // Inyecta el objeto Response de Express para controlar manualmente la respuesta HTTP
    @Param('imageName') imageName: string, // Extrae el parámetro 'imageName' de la URL
  ) {
    // Obtiene la ruta absoluta del archivo de imagen usando el servicio FilesService
    const path = this.filesService.getStaticProductImage(imageName);

    // Envía el archivo de imagen como respuesta al cliente
    res.sendFile(path);
  }

  // Define el endpoint POST /files/product para subir archivos de productos
  @Post('product')
  // Usa el interceptor FileInterceptor para procesar la subida de archivos en el campo 'file'
  @UseInterceptors(
    FileInterceptor('file', {
      // Aplica un filtro personalizado para validar el tipo de archivo
      fileFilter: fileFilter,
      // (Opcional) Limita el tamaño máximo del archivo a 5MB
      //limits: { fileSize: 5 * 1024 * 1024 },
      // Configura el almacenamiento en disco para los archivos subidos
      storage: diskStorage({
        // Carpeta donde se guardarán los archivos
        destination: './static/products',
        // Función personalizada para nombrar los archivos
        filename: fileNamer,
      }),
    }),
  )

  // El decorador @UploadedFile() extrae el archivo subido en la petición HTTP y lo asigna al parámetro 'file'.
  // Maneja la subida de archivos para productos
  uploadProductFile(@UploadedFile() file: Express.Multer.File) {
    // Verifica si se recibió un archivo en la petición
    if (!file) {
      // Si no hay archivo, lanza una excepción con código 400 (Bad Request)
      throw new BadRequestException('No file provided');
    }

    // Obtiene el nombre del archivo guardado en el servidor
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    // Retorna un objeto con el nombre del archivo (puedes construir aquí la URL completa si lo deseas)
    return {
      secureUrl,
    };
  }
}
