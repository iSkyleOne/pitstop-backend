import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guards';
import { EmailModule } from './email/email.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        UsersModule,
        AuthModule,
        EmailModule,
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
