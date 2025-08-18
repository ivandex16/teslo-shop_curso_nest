import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    console.log(data);

    const req = ctx.switchToHttp().getRequest();
    const rawHeaders = req.rawHeaders;

    if (!rawHeaders) {
      throw new InternalServerErrorException(
        'No se pudo obtener el usuario - asegúrate de usar el AuthGuard',
      );
    }
    return data ? rawHeaders[data] : rawHeaders;
  },
);
