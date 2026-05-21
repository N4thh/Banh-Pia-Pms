import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AdminDto { 
    @IsString()
    @IsNotEmpty()
    username!: string; 

    @IsString()
    @MinLength(6, {message: "Mật khẩu phải từ 6 ký tự trở lên"} )
    password!: string;

}