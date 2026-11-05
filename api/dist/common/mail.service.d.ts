export declare class MailService {
    private readonly log;
    private readonly transporter;
    private readonly from;
    private readonly appUrl;
    constructor();
    get enabled(): boolean;
    send(to: string, subject: string, body: string, link?: string): Promise<void>;
}
