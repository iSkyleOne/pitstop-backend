import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAvailableTimesDto } from './dto/find-available.times.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Post('available-times')
    @UseGuards(JwtAuthGuard)
    public async findAvailableTimes(@Body() findTimesDto: FindAvailableTimesDto) {
        console.log(findTimesDto);
        return await this.appointmentsService.findAvailableTimes(findTimesDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Req() req: Request, @Body() createAppointmentDto: CreateAppointmentDto) {
        const clientId = (req.user as any)?.id;
        return await this.appointmentsService.create(createAppointmentDto, clientId);
    }

    @Get('my-appointments')
    @UseGuards(JwtAuthGuard)
    async getMyAppointments(@Req() req: Request) {
        const clientId = (req.user as any)?.id;
        return await this.appointmentsService.findAllByClient(clientId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return await this.appointmentsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return await this.appointmentsService.update(id, updateAppointmentDto);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@Param('id') id: string) {
        return await this.appointmentsService.cancel(id);
    }

    @Patch(':id/confirm')
    @UseGuards(JwtAuthGuard)
    async confirm(@Param('id') id: string) {
        return await this.appointmentsService.confirm(id);
    }
}