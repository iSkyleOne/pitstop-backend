import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from 'src/database/shemas/appointment.schema';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
    status: AppointmentStatus;
}
