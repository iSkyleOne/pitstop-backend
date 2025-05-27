import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { User } from "src/database/shemas/user.schema";
import { CreateUserDto } from "./dto/user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/guards/auth/jwt.guard";
import { Request } from "express";
import { EmailService, SendgridTemplate } from "src/email/email.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly emailService: EmailService,
    ) {}


    @Post()
    @UseGuards(JwtAuthGuard)
    public async create(@Body() user: CreateUserDto): Promise<User> {
        return await this.userService.create(user);
    }

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    public async getCurrentUser(@Req() req: Request): Promise<User | null> {
       const userId = (req.user as any)?.id;
		const user: User = await this.userService.fetchById(userId);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (user.password) delete user.password;
		if (user.hids) delete user.hids;

		return user;
    }


    @Post('/register')
    public async register(@Body() user: CreateUserDto): Promise<void> {
        try {
            await this.userService.register(user);
            await this.emailService.sendEmailWithTemplate(user.email, SendgridTemplate.REGISTER, {
                account_name: user.firstName + ' ' + user.lastName,
                account_email: user.email,
    
            })
        } catch (err) {
            console.error(err);
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('/myself')
    @UseGuards(JwtAuthGuard)
    public async updateMyself(@Req() req: Request, @Body() payload: Partial<User>): Promise<User> {
        const userId = (req.user as any)?.id;

        if (!userId) {
            throw new UnauthorizedException('User not found');
        }

        const user: User = await this.userService.update(userId, payload);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (payload.email) delete payload.email;
        if (payload.password) delete payload.password;
        if (payload.hids) delete payload.hids;
        
        const userUpdated: User = await this.userService.update(userId, payload);

        return userUpdated;
    }   

    @Get('/all')
    @UseGuards(JwtAuthGuard)
    public async fetch(): Promise<User[]> {
        return await this.userService.fetch();
    }
    
    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    public async fetchById(@Param('id') id: string): Promise<User> {
        const user: User | null =  await this.userService.fetchById(id);

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        return user;
    }
}
