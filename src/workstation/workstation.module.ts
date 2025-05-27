import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workstation, WorkstationSchema } from '../database/shemas/workstation.schema';
import { WorkstationController } from './workstation.controller';
import { WorkstationService } from './workstation.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Workstation.name,
                schema: WorkstationSchema,
            },
        ]),
    ],
    controllers: [WorkstationController],
    providers: [WorkstationService],
    exports: [WorkstationService],
})
export class WorkstationModule { }
