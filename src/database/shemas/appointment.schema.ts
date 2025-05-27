import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Appointment {
    public _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    public clientId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
    public carId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ServiceType', required: true })
    public serviceTypeId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Workstation', required: true })
    public workstationId: Types.ObjectId;

    @Prop({ required: true })
    public appointmentDate: Date; // Data programării (doar data, fără oră)

    @Prop({ required: true })
    public startTime: string; // Ora de început (format HH:mm)

    @Prop({ required: true })
    public endTime: string; // Ora de sfârșit (format HH:mm)

    @Prop({ 
        type: String, 
        enum: Object.values(AppointmentStatus), 
        default: AppointmentStatus.PENDING 
    })
    public status: AppointmentStatus;

    @Prop()
    public notes?: string;

    @Prop({ required: true })
    public estimatedDuration: number; // în minute

    constructor(data: Partial<Appointment>) {
        Object.assign(this, data);
    }
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
AppointmentSchema.loadClass(Appointment);