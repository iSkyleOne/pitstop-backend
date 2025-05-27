import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppointmentDto {
    @IsMongoId()
    @IsNotEmpty()
    carId: string;

    @IsMongoId()
    @IsNotEmpty()
    serviceTypeId: string;

    @IsDateString()
    @IsNotEmpty()
    appointmentDate: string; // Data programării (YYYY-MM-DD)

    @IsString()
    @IsNotEmpty()
    selectedTime: string; // Ora selectată (HH:mm)

    @IsString()
    @IsOptional()
    notes?: string;

    // estimatedDuration se calculează automat din ServiceType
}