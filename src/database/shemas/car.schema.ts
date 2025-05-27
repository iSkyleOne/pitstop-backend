import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { OmitType } from "@nestjs/swagger";
import { Document, Types } from "mongoose";

export type CarDocument = Car & Document;

@Schema()
export class Car {
    public _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    public userId: Types.ObjectId;

    @Prop({ required: true })
    public brand: string;

    @Prop({ required: true })
    public model: string;

    @Prop({ required: true })
    public year: number;

    @Prop({ required: true })
    public color: string;

    @Prop({ required: true })
    public licensePlate: string;

    @Prop({ required: true })
    public vin: string;

    @Prop({ required: true })
    public mileage: number;

    @Prop({ type: Date, default: null })
    public lastMaintenanceDate: Date | null;

    @Prop({ type: Date, default: null })
    public nextMaintenanceDate: Date | null;

    @Prop({ type: Date, required: true })
    public insuranceExpirationDate: Date;

    @Prop({ type: Date, required: true })
    public periodicInspectionExpirationDate: Date;

    @Prop({ type: Date, required: true })
    public vignetteExpirationDate: Date;

    constructor (data: Partial<Car>) {
        Object.assign(this, data);
    }
}

export class CarDto extends OmitType(Car, ['_id']) {
    public id: Types.ObjectId;
}

export const CarSchema = SchemaFactory.createForClass(Car);
CarSchema.loadClass(Car);
