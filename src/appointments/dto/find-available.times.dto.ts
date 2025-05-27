import { IsMongoId, IsNotEmpty, IsDateString } from "class-validator";

export interface AvailableTimeSlot {
    time: string; // Ora în format HH:mm
    workstationId: string;
    workstationName: string;
    slotDuration: number; // Durata slot-ului pentru această stație (15, 30 sau 60 min)
    available: boolean;
    slotsNeeded: number; // Câte slot-uri consecutive sunt necesare
}

export class FindAvailableTimesDto {
    @IsMongoId()
    @IsNotEmpty()
    serviceTypeId: string;

    @IsDateString()
    @IsNotEmpty()
    date: string; // Data pentru care căutăm ore disponibile (YYYY-MM-DD)

    // Durata nu mai este necesară - se ia automat din ServiceType
}