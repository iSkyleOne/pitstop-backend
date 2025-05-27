import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guards';
import { EmailModule } from './email/email.module';
import { CarModule } from './car/car.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { WorkstationModule } from './workstation/workstation.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        UsersModule,
        AuthModule,
        EmailModule,
        CarModule,
        AppointmentsModule,
        ServiceTypeModule,
        WorkstationModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        }
    ],
})
export class AppModule { }
