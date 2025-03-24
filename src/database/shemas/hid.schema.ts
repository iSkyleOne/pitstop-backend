import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    _id: false,
})
export class HardwareId {
    @Prop({ required: true})
    public ip: string;

    @Prop({ required: true })
    public userAgent: string;

    @Prop({ type: Date, default: new Date() })
    public timestamp: Date = new Date();

    constructor(data: Partial<HardwareId>) {
        Object.assign(this, data);
    }
}

export const HardwareIdSchema = SchemaFactory.createForClass(HardwareId);
HardwareIdSchema.loadClass(HardwareId);

export type HardwareIdDocument = HardwareId & Document;
