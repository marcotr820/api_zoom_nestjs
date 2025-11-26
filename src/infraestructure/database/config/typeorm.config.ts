import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuditoriaSubscriber } from 'src/common/subscribers/auditoria.subscriber';
//import { AuditoriaSubscriber } from 'src/common/subscribers/auditoria.subscriber';

export default class TypeOrmConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: configService.get<any>('DB_TYPE', 'postgres'),
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get<string>('DB_USERNAME', 'justicia'),
      password: configService.get<string>('DB_PASSWORD', 'justicia'),
      database: configService.get<string>('DB_NAME', 'justicia_dev'),
      entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
      subscribers: [AuditoriaSubscriber],
      extra: { connectionLimit: 1 },
      synchronize: false,
      logging: false,
      dropSchema: false,
      retryDelay: 3000,
      retryAttempts: 10,
    };
  }
}

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> =>
    TypeOrmConfig.getOrmConfig(configService),
  inject: [ConfigService],
};
