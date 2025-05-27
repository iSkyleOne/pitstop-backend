import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workstation } from 'src/database/shemas/workstation.schema';

@Injectable()
export class WorkstationService {
    constructor(
        @InjectModel(Workstation.name) private readonly workstationModel: Model<Workstation>,
    ) { }

    public async findAllByServiceTypeId(serviceTypeId: string): Promise<Workstation[]> {
        return (
            await this.workstationModel.find({ serviceTypeId: serviceTypeId }).lean().exec()
        ).map((workstation: Workstation) => new Workstation(workstation));
    }

    public async findAll(): Promise<Workstation[]> {
        return (
            await this.workstationModel.find().lean().exec()
        ).map((workstation: Workstation) => new Workstation(workstation));
    }

    public async findOne(id: string): Promise<Workstation> {
        const workstation: Workstation | null = await this.workstationModel.findById(new Types.ObjectId(id)).lean().exec();

        if (!workstation) {
            throw new HttpException('Workstation not found', 400);
        }
        
        return new Workstation(workstation);
    }

    public async create(payload: Partial<Workstation>): Promise<Workstation> {
        const workstation: Workstation = await this.workstationModel.create(payload);;

        return await this.findOne(workstation._id.toString());
    }

    public async update(id: string, payload: Partial<Workstation>): Promise<Workstation> {
        const workstation : Workstation = await this.findOne(id);
        const updatedWorkstation: Workstation | null = await this.workstationModel.findByIdAndUpdate(
            workstation._id,
            { ...payload },
            { new: true },
        ).lean().exec();

        if (!updatedWorkstation) {
            throw new HttpException('Workstation not found', 400);
        }

        return new Workstation(updatedWorkstation);
    }

    public async delete(id: string): Promise<void> {
        const workstation: Workstation = await this.findOne(id);

        if (!workstation) {
            throw new Error('Workstation not found');
        }

        try {
            await this.workstationModel.findByIdAndDelete(workstation._id).lean().exec();
        } catch (error) {
            throw new HttpException('Nu s-a putut sterge statia de lucru', 400);
        }
    }
}
