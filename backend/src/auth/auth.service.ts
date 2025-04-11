import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async login(username: string, pass:string){
        const user = await this.userService.validateUser(username, pass);
        if (!user) {
            return {status:'error'}
        }
        delete user.password
        const payload = {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin, 
          };
        let token = await this.jwtService.signAsync(payload)
        return {status:'success',data:payload, access_token : token}
    }
   
    
    async checkToken(token:string){
        try{
            console.log('check token ::-> ',token )
            let check = await this.jwtService.verifyAsync(token)
            console.log('response ::-> ', check)
            delete check.iat
            delete check.exp
            return {status:'success',data: check}
        }catch(e){
            return {status:'error'}
        }
    }
}
