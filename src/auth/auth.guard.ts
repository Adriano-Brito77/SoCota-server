import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Tentando extrair o token apenas dos cookies
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    try {
      // Verificando o token usando o segredo
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      // Adicionando o payload no request para que as rotas protegidas possam acessar
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Usuário não autenticado!!!!');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
