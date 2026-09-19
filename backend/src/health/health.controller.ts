import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'System health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-09-19T15:55:00.000Z' },
        service: { type: 'string', example: 'fieldops-backend' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fieldops-backend',
    };
  }
}
