import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';
import { MD5 } from 'crypto-js';
import mongoose, { Model } from "mongoose";
import { User } from "../database/shemas/user.schema";
import { CreateUserDto } from "./dto/user.dto";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly configService: ConfigService,
    ) {}

    public async create(payload: Partial<CreateUserDto>): Promise<User> {
        let password: string | null = null;
        if (payload.password) {
            password = MD5(payload.password).toString();
            password = await this.hashPassword(password);
        }
        
        return await this.userModel.create({
            ...payload,
            ...(!!password && { password }),
        });
    }


    public async fetch(): Promise<User[]> { 
        return this.userModel.find()
    }

    public async fetchByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
    }

    public async fetchById(id: string): Promise<User> {
        if (mongoose.Types.ObjectId.isValid(id) === false) {
            throw new HttpException('Invalid ID', 400);
        }

        const user: User | null = await this.userModel.findById(id);

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        return user;
    }

    public async update(id: string, payload: Partial<User>) {
        return this.userModel.findByIdAndUpdate(id, payload, { new: true });
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, parseInt(this.configService.getOrThrow<string>('AUTH_SALT_ROUNDS')));
    }

}