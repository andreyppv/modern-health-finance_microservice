import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class EmploymentInfoDto {
    @IsNotEmpty()
    @IsString()
    employmentStatus:string;

    @IsNotEmpty()
    @IsString()
    employerName:string;

    @IsNotEmpty()
    @IsString()
    employerphone:string;

    @IsNotEmpty()
    @IsString()
    dateofhired:string;

    @IsNotEmpty()
    @IsString()
    jobtitle:string;
    
    @IsNotEmpty()
    @IsString()
    payrollFreq:string;

    @IsNotEmpty()
    @IsString()
    paymentdate:string;


}
