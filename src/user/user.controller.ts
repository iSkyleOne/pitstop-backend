import { Body, Controller, Get, HttpException, Param, Post, Req, UseGuards } from "@nestjs/common";
import { User } from "src/database/shemas/user.schema";
import { CreateUserDto } from "./dto/user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/guards/auth/jwt.guard";
import { Request } from "express";

@Controller('user')
export class UserController {
    constructor(
        private readonly usersService: UserService,
    ) {}


    @Post()
    @UseGuards(JwtAuthGuard)
    public async create(@Body() user: CreateUserDto): Promise<User> {
        return await this.usersService.create(user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    public async getCurrentUser(@Req() req: Request): Promise<User | null> {
        const userId = (req.user as any)?.id;
        const user: User | null = await this.usersService.fetchById(userId);

        return user;
    }

    @Get('/all')
    @UseGuards(JwtAuthGuard)
    public async fetch(): Promise<User[]> {
        return await this.usersService.fetch();
    }
    
    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    public async fetchById(@Param('id') id: string): Promise<User> {
        const user: User | null =  await this.usersService.fetchById(id);

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        return user;
    }
}
