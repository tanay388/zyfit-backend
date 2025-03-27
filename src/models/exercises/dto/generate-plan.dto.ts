import { IsNotEmpty, IsString } from "class-validator";

export class GeneratePlanDto {

    @IsString()
    @IsNotEmpty()
    userId: string;
}