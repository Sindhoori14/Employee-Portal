import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private log;
    catch(err: any, host: ArgumentsHost): any;
}
