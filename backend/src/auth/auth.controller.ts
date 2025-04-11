import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: {username: string; password: string}){
        return this.authService.login(loginDto.username,loginDto.password)
    }
    @Get('verify')
    async verifyToken(@Query() queryParams: {token:string}){
        return this.authService.checkToken(queryParams.token)
    }
    
} 
function isValidToken(token: string){
    return true
}