import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car } from 'src/database/shemas/car.schema';
import { User } from 'src/database/shemas/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CarService {
    constructor(
        @InjectModel(Car.name) private readonly carModel: Model<Car>,
        private readonly userService: UserService,
    ) { }

    public async create(payload: Partial<Car>): Promise<Car> {
        if (!payload.userId) throw new HttpException('User ID is required', 400);

        const user: User | null = await this.userService.fetchById(payload.userId.toString());

        if (!user) throw new HttpException('User not found', 404);
        
        const car: Car | null = await this.carModel.create(payload);

        return await this.findOne(car._id.toString());
    }

    public async fetchCustomerCars(userId: string): Promise<Car[]> {
        const user: User | null = await this.userService.fetchById(userId);

        if (!user) throw new HttpException('User not found', 404);

        return (await this.carModel.find({ userId }).lean().exec()).map((car: Car) => new Car(car));
    }

    public async findOne(id: string): Promise<Car> {
        const car: Car | null = await this.carModel.findById(new Types.ObjectId(id)).lean().exec();

        if (!car) {
            throw new HttpException('Car not found', 404);
        }

        return new Car(car);
    }

    public async update(id: string, payload: Partial<Car>): Promise<Car> {
        const car: Car | null = await this.findOne(id);

        if (payload.userId) delete payload.userId;

        const updatedCar: Car | null = await this.carModel.findByIdAndUpdate(
            car._id,
            { ...payload },
            { new: true },
        ).lean().exec();

        return new Car(updatedCar!);
    }

    public async delete(id: string): Promise<void> {
        const car: Car | null = await this.findOne(id);

        if (!car) {
            throw new HttpException('Car not found', 404);
        }

        await this.carModel.deleteOne({ _id: car._id }).exec();
    }
}
