import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkstationDocument = Workstation & Document;

@Schema({ timestamps: true })
export class Workstation {
    public _id: Types.ObjectId;

    @Prop({ required: true })
    public name: string;

    @Prop({ type: [Number], required: true, min: 0, max: 6 })
    public activeDays: number[];

    @Prop({
        type: [
            {
                start: { type: String, required: true },
                end: { type: String, required: true },
            },
        ],
        required: true,
    })
    public workingHours: { start: string; end: string }[];

    @Prop({
        type: Types.ObjectId,
        ref: 'ServiceType',
        required: true,
    })
    public serviceType: Types.ObjectId;

    constructor(data: Partial<Workstation>) {
        Object.assign(this, data);
    }
}

export const WorkstationSchema = SchemaFactory.createForClass(Workstation);
WorkstationSchema.loadClass(Workstation);
