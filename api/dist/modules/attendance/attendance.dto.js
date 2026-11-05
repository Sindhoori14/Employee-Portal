"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAttendanceDto = exports.StartBreakDto = exports.CheckOutDto = exports.CheckInDto = void 0;
const class_validator_1 = require("class-validator");
class CheckInDto {
    mode;
    note;
}
exports.CheckInDto = CheckInDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['OFFICE', 'REMOTE']),
    __metadata("design:type", String)
], CheckInDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CheckInDto.prototype, "note", void 0);
class CheckOutDto {
    note;
}
exports.CheckOutDto = CheckOutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CheckOutDto.prototype, "note", void 0);
class StartBreakDto {
    reason;
    note;
}
exports.StartBreakDto = StartBreakDto;
__decorate([
    (0, class_validator_1.IsIn)(['LUNCH', 'TEA', 'PERSONAL', 'OTHER']),
    __metadata("design:type", String)
], StartBreakDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], StartBreakDto.prototype, "note", void 0);
class MarkAttendanceDto {
    userId;
    day;
    status;
    checkIn;
    checkOut;
    mode;
    reason;
}
exports.MarkAttendanceDto = MarkAttendanceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "day", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['PRESENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]?\d|2[0-3]):[0-5]\d$/),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "checkIn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]?\d|2[0-3]):[0-5]\d$/),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "checkOut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['OFFICE', 'REMOTE']),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "reason", void 0);
//# sourceMappingURL=attendance.dto.js.map