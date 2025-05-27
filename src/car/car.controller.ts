import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CarService } from './car.service';
import { Car, CarDto } from '../database/shemas/car.schema';
import { JwtAuthGuard } from '../guards/auth/jwt.guard';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Controller('car')
export class CarController {
    constructor(
        private readonly carService: CarService,
        private readonly userService: UserService,
    ) { }

    @Post('add')
    @UseGuards(JwtAuthGuard)
    public async create(@Req() req: Request, @Body() payload: Partial<Car>): Promise<Car> {
        return this.carService.create({
            ...payload,
            userId: (req.user as any)?.id,
        });
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    public async findAll(@Req() req: Request): Promise<CarDto[]> {
        return (await this.carService.fetchCustomerCars((req.user as any)?.id)).map((car: Car) => {
            const { _id, ...rest } = car as any;
            return {
                ...rest,
                id: _id.toString(),
            } as CarDto;
        });
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    public async findOne(@Param('id') id: string): Promise<Car> {
        return this.carService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    public async update(@Param('id') id: string, @Body() payload: Partial<Car>): Promise<Car> {
        return this.carService.update(id, payload);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    public async remove(@Param('id') id: string): Promise<void> {
        return this.carService.delete(id);
    }
}
