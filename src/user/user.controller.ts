import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { User } from "src/database/shemas/user.schema";
import { CreateUserDto } from "./dto/user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/guards/auth/jwt.guard";
import { Request } from "express";
import { EmailService, SendgridTemplate } from "src/email/email.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly usersService: UserService,
        private readonly emailService: EmailService,
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

    @Get('/test') 
    @UseGuards(JwtAuthGuard)
    public async test() {
        await this.emailService.sendTestEmail('toma.toma.constantin@gmail.com');
    }

    @Post('/register')
    public async register(@Body() user: CreateUserDto): Promise<void> {
        try {
            await this.usersService.register(user);
            await this.emailService.sendEmailWithTemplate(user.email, SendgridTemplate.REGISTER, {
                account_name: user.firstName + ' ' + user.lastName,
                account_email: user.email,
    
            })
        } catch (err) {
            console.error(err);
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
