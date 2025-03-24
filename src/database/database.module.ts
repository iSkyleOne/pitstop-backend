import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { getMongoConfig } from "./mongo.config";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                if (!configService) {
                    throw new Error('ConfigService is not provided');
                }

                return getMongoConfig(configService);
            },
        }),
    ],
})
export class DatabaseModule {}