import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../database/shemas/user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { EmailModule } from "src/email/email.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        EmailModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}