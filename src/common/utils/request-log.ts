import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { ApiRequest } from '../entities/api-request.entity';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly CACHE_KEY = 'request_logs';
  private readonly CACHE_TTL = 900000; // 10 minutes
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;

        const requestLog = {
          path: request.url,
          userId: (request.user as any)?.uid,
          method: request.method,
          status: response.statusCode,
          headers: request.headers,
          body: request.body,
          ip: this.getIpAddress(request),
          timestamp: new Date().toISOString(),
          durationMs: duration
        };

        this.logRequestToCache(requestLog);
      })
    );
  }

  private async logRequestToCache(requestLog: any) {
    const currentLogs = (await this.cacheManager.get<any[]>(this.CACHE_KEY)) || [];
    currentLogs.push(requestLog);
    await this.cacheManager.set(this.CACHE_KEY, currentLogs, this.CACHE_TTL);
  }

  private getIpAddress(request: any): string {
    let ip = request.ip || request.connection.remoteAddress;
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    }
    ip = ip.replace(/^::ffff:/, '');
    return ip === '::1' ? '127.0.0.1' : ip;
  }

  @Interval(12000) // Run every 2 minutes
  async saveRequestsToDB() {
    const requests = await this.cacheManager.get<any[]>(this.CACHE_KEY);
    if (requests && requests.length > 0) {
      await ApiRequest.save(requests);
      await this.cacheManager.del(this.CACHE_KEY);
    }
  }
}