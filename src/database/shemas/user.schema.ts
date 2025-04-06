import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { compare } from "bcrypt";
import { HardwareId, HardwareIdSchema } from "./hid.schema";

export type UserDocument = User & Document;

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

    @Prop({ type: [HardwareIdSchema], default: [], maxlength: 3 })
    public hids: HardwareId[] = [];

    @Prop()
    public password: string;

    

    public get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public async verifyPassword(password: string): Promise<boolean> {
        return compare(password, this.password);
    }

    constructor (data: Partial<User>) {
        Object.assign(this, data);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

