import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getMongoConfig = (configService: ConfigService): MongooseModuleOptions => {
    const user = configService.get<string>('MONGO_USER');
    const pass = configService.get<string>('MONGO_PASS');
    const host = configService.getOrThrow<string>('MONGO_HOST');
    const port = configService.getOrThrow<string>('MONGO_PORT');
    const db = configService.getOrThrow<string>('MONGO_DB');
    
    const uri = user?.length && pass?.length 
        ? `mongodb://${user}:${pass}@${host}:${port}/${db}` 
        : `mongodb://${host}:${port}/${db}`;
    
    return {
        uri,
    };
};
