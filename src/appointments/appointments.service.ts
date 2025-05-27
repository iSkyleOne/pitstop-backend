import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentStatus } from '../database/shemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { WorkstationService } from '../workstation/workstation.service';
import { Workstation } from '../database/shemas/workstation.schema';
import { ServiceTypeService } from '../service-type/service-type.service';
import { AvailableTimeSlot, FindAvailableTimesDto } from './dto/find-available.times.dto';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
        private readonly workstationService: WorkstationService,
        private readonly serviceTypeService: ServiceTypeService,
    ) {}

    // Găsește orele disponibile pentru o dată specifică
    public async findAvailableTimes(dto: FindAvailableTimesDto): Promise<AvailableTimeSlot[]> {
        const { serviceTypeId, date } = dto;

        // Găsește tipul de serviciu și durata acestuia
        const serviceType = await this.serviceTypeService.findOne(serviceTypeId);
        const duration = serviceType.estimatedDuration;

        // Găsește toate stațiile de lucru pentru tipul de serviciu
        const workstations = await this.workstationService.findAllByServiceTypeId(serviceTypeId);

        console.log(workstations);
        
        if (workstations.length === 0) {
            throw new HttpException('Nu există stații de lucru disponibile pentru acest serviciu', 404);
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay(); // 0 = Duminică, 1 = Luni, etc.

        // Filtrează stațiile care lucrează în ziua respectivă
        const activeWorkstations = workstations.filter(ws => ws.activeDays.includes(dayOfWeek));

        if (activeWorkstations.length === 0) {
            return []; // Nu lucrează nimeni în ziua respectivă
        }

        // Obține programările existente pentru ziua respectivă
        const existingAppointments = await this.getAppointmentsForDate(targetDate);

        // Generează toate orele posibile pentru fiecare stație
        const allAvailableTimes: AvailableTimeSlot[] = [];

        for (const workstation of activeWorkstations) {
            const workstationTimes = this.generateTimeSlotsForWorkstation(
                workstation,
                duration,
                existingAppointments,
                targetDate
            );
            allAvailableTimes.push(...workstationTimes);
        }

        // Grupează orele pe timp și păstrează cea mai bună opțiune pentru fiecare oră
        const timeGroups = new Map<string, AvailableTimeSlot[]>();

        allAvailableTimes.forEach(slot => {
            if (!timeGroups.has(slot.time)) {
                timeGroups.set(slot.time, []);
            }
            timeGroups.get(slot.time)!.push(slot);
        });

        // Pentru fiecare oră, alege cea mai bună stație disponibilă
        const result: AvailableTimeSlot[] = [];
        timeGroups.forEach((slots, time) => {
            // Sortează slot-urile: primul criteriu = available, al doilea = slot-uri mai mici (mai flexibile)
            const sortedSlots = slots.sort((a, b) => {
                if (a.available !== b.available) return b.available ? 1 : -1;
                return a.slotDuration - b.slotDuration;
            });

            result.push(sortedSlots[0]);
        });

        // Sortează orele
        return result.sort((a, b) => a.time.localeCompare(b.time));
    }

    // Generează slot-urile de timp pentru o stație specifică
    private generateTimeSlotsForWorkstation(
        workstation: Workstation,
        requestedDuration: number,
        existingAppointments: Appointment[],
        targetDate: Date
    ): AvailableTimeSlot[] {
        const slots: AvailableTimeSlot[] = [];
        const slotDuration = workstation.slotDuration; // 15, 30 sau 60 minute
        const slotsNeeded = Math.ceil(requestedDuration / slotDuration); // Câte slot-uri consecutive sunt necesare

        // Pentru fiecare interval de lucru al stației
        for (const workingHour of workstation.workingHours) {
            const [startHour, startMinute] = workingHour.start.split(':').map(Number);
            const [endHour, endMinute] = workingHour.end.split(':').map(Number);

            // Generează slot-uri la fiecare interval de slotDuration minute
            let currentHour = startHour;
            let currentMinute = startMinute;

            while (true) {
                const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                
                // Verifică dacă avem suficiente slot-uri consecutive disponibile
                const consecutiveSlotsAvailable = this.checkConsecutiveSlotsAvailability(
                    workstation,
                    timeString,
                    slotsNeeded,
                    workingHour.end,
                    existingAppointments,
                    targetDate
                );

                // Verifică dacă slot-ul nu e în trecut
                const isNotInPast = this.isTimeInFuture(targetDate, timeString);

                slots.push({
                    time: timeString,
                    workstationId: workstation._id.toString(),
                    workstationName: workstation.name,
                    slotDuration: slotDuration,
                    available: consecutiveSlotsAvailable && isNotInPast,
                    slotsNeeded: slotsNeeded
                });

                // Avansează cu durata slot-ului
                currentMinute += slotDuration;
                if (currentMinute >= 60) {
                    currentMinute = currentMinute % 60;
                    currentHour += Math.floor((currentMinute + slotDuration) / 60);
                }

                // Verifică dacă am ieșit din intervalul de lucru
                const currentTimeMinutes = currentHour * 60 + currentMinute;
                const endTimeMinutes = endHour * 60 + endMinute;
                
                if (currentTimeMinutes >= endTimeMinutes) {
                    break;
                }
            }
        }

        return slots;
    }

    // Verifică disponibilitatea slot-urilor consecutive
    private checkConsecutiveSlotsAvailability(
        workstation: Workstation,
        startTime: string,
        slotsNeeded: number,
        workingHourEnd: string,
        existingAppointments: Appointment[],
        targetDate: Date
    ): boolean {
        const slotDuration = workstation.slotDuration;
        
        // Calculează timpul de sfârșit pentru toate slot-urile necesare
        const totalDurationNeeded = slotsNeeded * slotDuration;
        const endTime = this.addMinutesToTime(startTime, totalDurationNeeded);

        // Verifică dacă timpul de sfârșit încape în intervalul de lucru
        if (!this.timeIsBeforeOrEqual(endTime, workingHourEnd)) {
            return false;
        }

        // Verifică fiecare slot individual pentru conflicte
        for (let i = 0; i < slotsNeeded; i++) {
            const slotStart = this.addMinutesToTime(startTime, i * slotDuration);
            const slotEnd = this.addMinutesToTime(slotStart, slotDuration);

            // Verifică conflictul cu programările existente
            const hasConflict = this.hasConflictWithExistingAppointments(
                workstation._id,
                slotStart,
                slotEnd,
                existingAppointments
            );

            if (hasConflict) {
                return false;
            }
        }

        return true;
    }

    // Verifică dacă o oră este în viitor
    private isTimeInFuture(date: Date, time: string): boolean {
        const now = new Date();
        const [hour, minute] = time.split(':').map(Number);
        
        const targetDateTime = new Date(date);
        targetDateTime.setHours(hour, minute, 0, 0);

        return targetDateTime.getTime() > now.getTime();
    }

    // Adaugă minute la o oră și returnează noul timp
    private addMinutesToTime(time: string, minutes: number): string {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute + minutes;
        
        const newHour = Math.floor(totalMinutes / 60);
        const newMinute = totalMinutes % 60;
        
        return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
    }

    // Verifică dacă o oră este înainte sau egală cu alta
    private timeIsBeforeOrEqual(time1: string, time2: string): boolean {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        
        return (h1 * 60 + m1) <= (h2 * 60 + m2);
    }

    // Verifică conflicte cu programări existente
    private hasConflictWithExistingAppointments(
        workstationId: Types.ObjectId,
        startTime: string,
        endTime: string,
        existingAppointments: Appointment[]
    ): boolean {
        return existingAppointments.some(appointment => {
            if (!appointment.workstationId.equals(workstationId)) {
                return false;
            }

            // Verifică suprapunerea orelor
            return this.timesOverlap(startTime, endTime, appointment.startTime, appointment.endTime);
        });
    }

    // Verifică dacă două intervale orare se suprapun
    private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        const [h1s, m1s] = start1.split(':').map(Number);
        const [h1e, m1e] = end1.split(':').map(Number);
        const [h2s, m2s] = start2.split(':').map(Number);
        const [h2e, m2e] = end2.split(':').map(Number);

        const start1Minutes = h1s * 60 + m1s;
        const end1Minutes = h1e * 60 + m1e;
        const start2Minutes = h2s * 60 + m2s;
        const end2Minutes = h2e * 60 + m2e;

        return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
    }

    // Obține programările existente pentru o anumită zi
    private async getAppointmentsForDate(date: Date): Promise<Appointment[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await this.appointmentModel.find({
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: [AppointmentStatus.CANCELLED] }
        }).exec();
    }

    // Creează o programare pentru ora selectată
    async create(createAppointmentDto: CreateAppointmentDto, clientId: string): Promise<Appointment> {
        const { carId, serviceTypeId, appointmentDate, selectedTime, notes } = createAppointmentDto;

        // Găsește tipul de serviciu și durata acestuia
        const serviceType = await this.serviceTypeService.findOne(serviceTypeId);
        const estimatedDuration = serviceType.estimatedDuration;

        // Verifică din nou disponibilitatea pentru ora selectată
        const availableTimes = await this.findAvailableTimes({
            serviceTypeId,
            date: appointmentDate
        });

        const selectedSlot = availableTimes.find(slot => slot.time === selectedTime && slot.available);

        if (!selectedSlot) {
            throw new HttpException('Ora selectată nu mai este disponibilă', 400);
        }

        // Calculează ora de sfârșit bazată pe slot-urile necesare
        const totalDuration = selectedSlot.slotsNeeded * selectedSlot.slotDuration;
        const endTime = this.addMinutesToTime(selectedTime, totalDuration);

        // Creează programarea
        const appointment = await this.appointmentModel.create({
            clientId: new Types.ObjectId(clientId),
            carId: new Types.ObjectId(carId),
            serviceTypeId: new Types.ObjectId(serviceTypeId),
            workstationId: new Types.ObjectId(selectedSlot.workstationId),
            appointmentDate: new Date(appointmentDate),
            startTime: selectedTime,
            endTime: endTime,
            estimatedDuration: totalDuration, // Durata reală bazată pe slot-uri
            notes,
            status: AppointmentStatus.PENDING
        });

        return appointment;
    }

    // Găsește toate programările pentru un client
    async findAllByClient(clientId: string): Promise<Appointment[]> {
        return await this.appointmentModel
            .find({ clientId: new Types.ObjectId(clientId) })
            .populate('carId')
            .populate('serviceTypeId')
            .populate('workstationId')
            .sort({ appointmentDate: -1, startTime: -1 })
            .exec();
    }

    // Găsește o programare după ID
    async findOne(id: string): Promise<Appointment> {
        const appointment = await this.appointmentModel
            .findById(new Types.ObjectId(id))
            .populate('clientId')
            .populate('carId')
            .populate('serviceTypeId')
            .populate('workstationId')
            .exec();

        if (!appointment) {
            throw new HttpException('Programarea nu a fost găsită', 404);
        }

        return appointment;
    }

    // Actualizează o programare
    async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
        const appointment = await this.appointmentModel
            .findByIdAndUpdate(new Types.ObjectId(id), updateAppointmentDto, { new: true })
            .exec();

        if (!appointment) {
            throw new HttpException('Programarea nu a fost găsită', 404);
        }

        return appointment;
    }

    // Anulează o programare
    async cancel(id: string): Promise<Appointment> {
        return await this.update(id, { status: AppointmentStatus.CANCELLED });
    }

    // Confirmă o programare
    async confirm(id: string): Promise<Appointment> {
        return await this.update(id, { status: AppointmentStatus.CONFIRMED });
    }
}