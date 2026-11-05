export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Array<"ADMIN" | "TEAM_LEAD" | "COORDINATOR" | "EMPLOYEE">) => import("@nestjs/common").CustomDecorator<string>;
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
