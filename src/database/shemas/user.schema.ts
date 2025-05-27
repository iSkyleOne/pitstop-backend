import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { compare } from "bcrypt";
import { HardwareId, HardwareIdSchema } from "./hid.schema";
import { Role } from "src/permissions/role";

export type UserDocument = User & Document;

export enum UserType {
    BUSINESS = 'business',
    CLIENT = 'client',
}

@Schema()
export class User {
    public _id: Types.ObjectId;

    @Prop({ required: true })
    public firstName: string;

    @Prop({ required: true })
    public lastName: string;

    @Prop({ unique: true, required: true })
    public email: string;

    @Prop()
    public phoneNumber: string;

    @Prop({ default: true })
    public active: boolean = true;

    @Prop()
    public country: string;

    @Prop()
    public city: string;

    @Prop()
    public address: string;

    @Prop({ type: [HardwareIdSchema], default: [], maxlength: 3 })
    public hids?: HardwareId[] = [];

    @Prop({
        type: String,
        enum: Object.values(UserType),
        default: UserType.CLIENT,
    })
    public userType: UserType = UserType.CLIENT;

    @Prop({
        type: String,
        enum: Object.values(Role),
        default: Role.CLIENT,
    })
    public role: Role = Role.CLIENT;

    @Prop()
    public password?: string;

    public get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public async verifyPassword(password: string): Promise<boolean> {
        if (!this.password) {
            return false;
        }
        
        return compare(password, this.password);
    }

    constructor (data: Partial<User>) {
        Object.assign(this, data);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
