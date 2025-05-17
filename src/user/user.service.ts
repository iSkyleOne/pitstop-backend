import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';
import { MD5 } from 'crypto-js';
import mongoose, { Model, Types } from "mongoose";
import { User } from "../database/shemas/user.schema";
import { CreateUserDto } from "./dto/user.dto";
import { use } from "passport";


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
        return this.userModel.find().lean().exec();
    }

    public async fetchByEmail(email: string): Promise<User | null> {
        const user: User | null = await this.userModel.findOne({ email }).lean().exec();

        if (!user) {
            return null;
        }

        return new User(user);
    }

    public async fetchById(id: string): Promise<User> {
        if (mongoose.Types.ObjectId.isValid(id) === false) {
            throw new HttpException('Invalid ID', 400);
        }

        const user: User | null = await this.userModel.findById(new Types.ObjectId(id)).lean().exec();

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        return new User(user);
    }

    public async update(id: string, payload: Partial<User>) {
        const user: User | null = await this.fetchById(id);
        const updatedUser = await this.userModel.findByIdAndUpdate(user._id, payload, { new: true }).lean().exec();

        if (!updatedUser) {
            throw new HttpException('User not found', 404);
        }
        return new User(updatedUser);
    }

    public async register(payload: Partial<CreateUserDto>): Promise<User> {
        console.log('payload', payload);
        const user: User | null = await this.fetchByEmail(payload.email!);

        if (user) {
            throw new HttpException('Acest email este deja folosit.', 409);
        }

        let password: string | null = null;
        if (payload.password) {
            password = MD5(payload.password).toString();
            password = await this.hashPassword(password);
        }

        console.log('payload', payload);

        return await this.userModel.create({
            ...payload,
            ...(!!password && { password }),
        });
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, parseInt(this.configService.getOrThrow<string>('AUTH_SALT_ROUNDS')));
    }

}