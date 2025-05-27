import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceType, ServiceTypeDto } from 'src/database/shemas/service-type.schema';
import { WorkstationService } from 'src/workstation/workstation.service';

@Injectable()
export class ServiceTypeService {
    constructor(
        @InjectModel(ServiceType.name) private readonly serviceTypeModel: Model<ServiceType>,
        private readonly workstationService: WorkstationService,
    ) {}

    public async create(payload: Partial<ServiceType>): Promise<ServiceType> {
        const serviceType: ServiceType = await this.serviceTypeModel.create(payload);
        return serviceType;
    }

    public async findAll(): Promise<ServiceTypeDto[]> {
        return (await this.serviceTypeModel.find().lean().exec()).map((serviceType: ServiceType) => ({
            ...serviceType,
            id: serviceType._id
        }) as ServiceTypeDto);
    }

    public async findOne(id: string): Promise<ServiceType> {
        const serviceType: ServiceType | null = await this.serviceTypeModel.findById(new Types.ObjectId(id)).lean().exec();
        if (!serviceType) {
            throw new Error('Service Type not found');
        }
        return serviceType;
    }

    public async update(id: string, payload: Partial<ServiceType>): Promise<ServiceType> {
        const serviceType: ServiceType | null = await this.serviceTypeModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            payload,
            { new: true },
        ).lean().exec();
        if (!serviceType) {
            throw new Error('Service Type not found');
        }
        return serviceType;
    }

    public async delete(id: string): Promise<void> {
        const serviceType: ServiceType | null = await this.serviceTypeModel.findByIdAndDelete(new Types.ObjectId(id)).lean().exec();
        
        if (!serviceType) {
            throw new Error('Service Type not found');
        }

        if ((await this.workstationService.findAllByServiceTypeId(serviceType._id.toString())).length > 0) {
            throw new HttpException('Nu se poate sterge acest serviciu, exista statii de lucru asociate', 400);
        }
    }
    
}
