export type Period = { year: number; month: number };
export const INITIAL_PERIOD: Period = { year: 2026, month: 9 };
export const DEMO_TODAY = '2026-10-07';
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const YEARS = [2024, 2025, 2026, 2027];
export type AttendanceStatus = 'present' | 'absent' | 'halfDay' | 'leave';
export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  halfDay: 'Half Day',
  leave: 'Leave',
};
export type AttendanceRecord = {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  source?: string;
  verified?: boolean;
};
export type Employee = {
  name: string;
  employeeId: string;
  designation: string;
  store: string;
  mobile: string;
  email: string;
  city: string;
};
export const DEFAULT_EMPLOYEE: Employee = {
  name: 'Ajay Kumar',
  employeeId: 'EMP-1',
  designation: 'Sales Executive',
  store: 'ABC Store',
  mobile: '',
  email: '',
  city: '',
};

export function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
    2,
    '0',
  )}`;
}
export function daysInMonth({ year, month }: Period) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
export function moveMonth(period: Period, delta: number): Period {
  const date = new Date(Date.UTC(period.year, period.month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}
export function calendarCells(period: Period) {
  const offset =
    (new Date(Date.UTC(period.year, period.month, 1)).getUTCDay() + 6) % 7;
  const count = Math.ceil((offset + daysInMonth(period)) / 7) * 7;
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      Date.UTC(period.year, period.month, index - offset + 1),
    );
    return {
      key: dateKey(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
      ),
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      current: date.getUTCMonth() === period.month,
    };
  });
}
export function displayDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1].slice(
    0,
    3,
  )} ${year}`;
}
export function periodLabel(period: Period) {
  return `${MONTHS[period.month]} ${period.year}`;
}
export function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Deterministic local fixtures, deliberately separate from future API responses.
// The reference month stops on 7 October, matching the supplied attendance design.
export function attendanceForPeriod(period: Period): AttendanceRecord[] {
  const fixture: AttendanceStatus[] = [
    'present',
    'present',
    'absent',
    'halfDay',
    'leave',
    'present',
    'present',
  ];
  return Array.from({ length: daysInMonth(period) }, (_, index) => {
    const day = index + 1;
    const date = dateKey(period.year, period.month, day);
    const status =
      period.year === 2026 && period.month === 9
        ? fixture[index % fixture.length]
        : fixture[(index + period.month) % fixture.length];
    const attends = status === 'present' || status === 'halfDay';
    return {
      date,
      status,
      ...(attends
        ? {
            checkIn: day === 7 ? '09:03 AM' : '09:00 AM',
            checkOut:
              status === 'halfDay'
                ? '01:30 PM'
                : day === 7
                ? '06:02 PM'
                : '06:00 PM',
            source: 'QR',
            verified: true,
          }
        : {}),
    };
  }).filter(record => record.date <= DEMO_TODAY);
}
export function attendanceSummary(records: AttendanceRecord[]) {
  const counts = { present: 0, absent: 0, halfDay: 0, leave: 0 };
  records.forEach(record => counts[record.status]++);
  return {
    ...counts,
    rate: records.length
      ? (((counts.present + counts.halfDay) / records.length) * 100).toFixed(1)
      : '0.0',
  };
}
export function payrollForPeriod(period: Period) {
  const available =
    period.year >= YEARS[0] &&
    dateKey(period.year, period.month, 1) <= DEMO_TODAY;
  const reference = period.year === 2026 && period.month === 9;
  const workingDays = available ? 26 : 0;
  const absent = available ? (reference ? 2 : (period.month % 3) + 1) : 0;
  const halfDay = available ? 1 : 0;
  const leave = available ? 1 : 0;
  const presentDays = available ? workingDays - absent - halfDay / 2 : 0;
  const monthlySalary = available ? 15000 : 0;
  const absentDeduction = available
    ? reference
      ? 1250
      : Math.round((monthlySalary * (absent + halfDay / 2)) / workingDays)
    : 0;
  const earnedSalary = monthlySalary - absentDeduction;
  const advanceDeduction = available ? 1000 : 0;
  // Earned salary already includes the absence deduction; subtract it only once.
  const netPayable = Math.max(0, earnedSalary - advanceDeduction);
  return {
    available,
    workingDays,
    absent,
    halfDay,
    leave,
    presentDays,
    monthlySalary,
    absentDeduction,
    earnedSalary,
    advanceDeduction,
    netPayable,
    paidOn: available ? dateKey(period.year, period.month, 1) : undefined,
    paymentMode: available ? 'UPI' : '—',
  };
}

export type PdfReport = {
  title: string;
  subtitle: string;
  employee: string;
  sections: { title: string; rows: { label: string; value: string }[] }[];
  note?: string;
};
export function salaryReport(period: Period, employee: Employee): PdfReport {
  const payroll = payrollForPeriod(period);
  return {
    title: 'Salary Slip',
    subtitle: periodLabel(period),
    employee: `${employee.name} | ${employee.employeeId}\n${employee.designation} | ${employee.store}`,
    sections: [
      {
        title: 'Attendance Summary',
        rows: [
          { label: 'Working Days', value: String(payroll.workingDays) },
          { label: 'Present Days', value: String(payroll.presentDays) },
          { label: 'Half Day', value: String(payroll.halfDay) },
          { label: 'Leave', value: String(payroll.leave) },
          { label: 'Absent', value: String(payroll.absent) },
        ],
      },
      {
        title: 'Salary Calculation',
        rows: [
          { label: 'Monthly Salary', value: money(payroll.monthlySalary) },
          {
            label: 'Absent Deduction',
            value: `-${money(payroll.absentDeduction)}`,
          },
          { label: 'Earned Salary', value: money(payroll.earnedSalary) },
          {
            label: 'Advance Deduction',
            value: `-${money(payroll.advanceDeduction)}`,
          },
          { label: 'Net Payable', value: money(payroll.netPayable) },
        ],
      },
      {
        title: 'Payment Status',
        rows: [
          {
            label: 'Status',
            value: payroll.available ? 'Paid' : 'Not available',
          },
          {
            label: 'Paid On',
            value: payroll.paidOn ? displayDate(payroll.paidOn) : '—',
          },
          { label: 'Payment Mode', value: payroll.paymentMode },
        ],
      },
    ],
    note: 'Demo salary slip. Earned salary is monthly salary less absence deductions. Net payable is earned salary less advance deductions.',
  };
}
