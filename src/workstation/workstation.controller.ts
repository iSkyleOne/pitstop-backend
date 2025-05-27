import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WorkstationService } from './workstation.service';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';
import { Workstation } from '../database/shemas/workstation.schema';

@Controller('workstation')
export class WorkstationController {
    constructor(private readonly workstationService: WorkstationService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    public async fetchAll(): Promise<Workstation[]> {
        return await this.workstationService.findAll();
    }

    @Get('by-service-type/:serviceTypeId')
    @UseGuards(JwtAuthGuard)
    public async fetchByServiceTypeId(serviceTypeId: string): Promise<Workstation[]> {
        return await this.workstationService.findAllByServiceTypeId(serviceTypeId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    public async fetchOne(id: string): Promise<Workstation> {
        return await this.workstationService.findOne(id);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    public async findAll(): Promise<Workstation[]> {
        return await this.workstationService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    public async create(@Body() payload: Partial<Workstation>): Promise<Workstation> {
        console.log(payload);
        return await this.workstationService.create(payload);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    public async update(@Param('id') id: string, @Body() payload: Partial<Workstation>): Promise<Workstation> {
        return await this.workstationService.update(id, payload);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    public async delete(@Param('id') id: string): Promise<void> {
        return await this.workstationService.delete(id);
    }
}
