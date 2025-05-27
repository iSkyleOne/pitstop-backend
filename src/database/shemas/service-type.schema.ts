import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OmitType } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ServiceTypeDocument = ServiceType & Document;

@Schema({ timestamps: true })
export class ServiceType {
    public _id: Types.ObjectId;

    @Prop({ required: true })
    public name: string;

    @Prop({ required: true })
    public estimatedDuration: number; // in minutes

    @Prop()
    public description?: string;
}

export class ServiceTypeDto extends ServiceType {
    public id: Types.ObjectId;
}


export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);