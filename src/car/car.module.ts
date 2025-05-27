import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from 'src/database/shemas/car.schema';
import { UsersModule } from 'src/user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Car.name,
                schema: CarSchema,
                collection: 'cars',
            },
        ]),
        UsersModule,
    ],
    controllers: [CarController],
    providers: [CarService],
    exports: [CarService],
})
export class CarModule { }
