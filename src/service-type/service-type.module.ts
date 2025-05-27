import { Module } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { ServiceTypeController } from './service-type.controller';
import { ServiceType, ServiceTypeSchema } from 'src/database/shemas/service-type.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkstationModule } from 'src/workstation/workstation.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ServiceType.name,
                schema: ServiceTypeSchema,
                collection: 'service-type',
            },
        ]),
        WorkstationModule,
    ],
    controllers: [ServiceTypeController],
    providers: [ServiceTypeService],
    exports: [ServiceTypeService],
})
export class ServiceTypeModule { }
