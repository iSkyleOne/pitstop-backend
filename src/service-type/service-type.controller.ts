import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { JwtAuthGuard } from 'src/guards/auth/jwt.guard';
import { ServiceType, ServiceTypeDto } from 'src/database/shemas/service-type.schema';

@Controller('service-type')
export class ServiceTypeController {
    constructor(private readonly serviceTypeService: ServiceTypeService) { }

    @Get('/all')
    @UseGuards(JwtAuthGuard)
    public async fetchAll(): Promise<ServiceTypeDto[]> {
        return await this.serviceTypeService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    public async fetchOne(id: string): Promise<ServiceType> {
        return await this.serviceTypeService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    public async create(@Body() payload: Partial<ServiceType>): Promise<ServiceType> {
        return await this.serviceTypeService.create(payload);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    public async update(@Param('id') id: string, @Body() payload: Partial<ServiceType>): Promise<ServiceType> {
        return await this.serviceTypeService.update(id, payload);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    public async delete(@Param('id') id: string): Promise<void> {
        return await this.serviceTypeService.delete(id);
    }
}
