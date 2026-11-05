"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRID_CODE = void 0;
exports.breakMinutes = breakMinutes;
exports.workedAndBreak = workedAndBreak;
exports.lateMinutes = lateMinutes;
exports.statusFor = statusFor;
exports.stateFor = stateFor;
exports.fmtMinutes = fmtMinutes;
const time_1 = require("../../common/time");
const MIN = 60_000;
function breakMinutes(breaks, from, to, now) {
    let total = 0;
    for (const b of breaks) {
        const s = Math.max(b.startAt.getTime(), from.getTime());
        const e = Math.min((b.endAt ?? now).getTime(), to.getTime());
        if (e > s)
            total += e - s;
    }
    return Math.floor(total / MIN);
}
function workedAndBreak(checkIn, checkOut, breaks, now) {
    const end = checkOut ?? now;
    const gross = Math.max(0, Math.floor((end.getTime() - checkIn.getTime()) / MIN));
    const br = Math.min(gross, breakMinutes(breaks, checkIn, end, now));
    return { worked: gross - br, breaks: br };
}
function lateMinutes(checkIn, cfg) {
    const m = (0, time_1.minutesOfDay)(checkIn);
    return m > cfg.shiftStart + cfg.graceMinutes ? m - cfg.shiftStart : 0;
}
function statusFor(late, finished, worked, cfg) {
    if (finished && worked < cfg.halfDayMinutes)
        return 'HALF_DAY';
    return late > 0 ? 'LATE' : 'PRESENT';
}
function stateFor(rec, hasOpenBreak, isToday, workingDay) {
    if (rec?.status === 'ON_LEAVE')
        return 'LEAVE';
    if (rec?.checkInAt)
        return rec.checkOutAt ? 'CHECKED_OUT' : hasOpenBreak ? 'ON_BREAK' : 'WORKING';
    if (!workingDay)
        return 'OFF';
    return isToday ? 'NOT_IN' : 'ABSENT';
}
exports.GRID_CODE = {
    WORKING: 'P', ON_BREAK: 'P', CHECKED_OUT: 'P', LATE: 'L', HALF: 'H', LEAVE: 'LV', NOT_IN: 'A', ABSENT: 'A', OFF: '-',
};
function fmtMinutes(m) {
    const h = Math.floor(m / 60);
    return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}
//# sourceMappingURL=attendance.logic.js.map