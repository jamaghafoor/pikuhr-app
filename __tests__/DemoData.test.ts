import {
  attendanceForPeriod,
  attendanceSummary,
  calendarCells,
  daysInMonth,
  moveMonth,
  payrollForPeriod,
  salaryReport,
  DEFAULT_EMPLOYEE,
} from '../src/data/demo';

test('calendar starts on Monday, includes adjacent dates and handles leap years and year boundaries', () => {
  const october = calendarCells({ year: 2026, month: 9 });
  expect(october[0].key).toBe('2026-09-28');
  expect(october).toHaveLength(35);
  expect(october.filter(cell => cell.current)).toHaveLength(31);
  expect(october[october.length - 1].key).toBe('2026-11-01');
  expect(daysInMonth({ year: 2024, month: 1 })).toBe(29);
  expect(daysInMonth({ year: 2026, month: 1 })).toBe(28);
  expect(moveMonth({ year: 2026, month: 11 }, 1)).toEqual({
    year: 2027,
    month: 0,
  });
  expect(moveMonth({ year: 2026, month: 0 }, -1)).toEqual({
    year: 2025,
    month: 11,
  });
});

test('reference attendance matches Figma, future months are empty and filtered totals use only matching records', () => {
  const records = attendanceForPeriod({ year: 2026, month: 9 });
  expect(records).toHaveLength(7);
  expect(attendanceSummary(records)).toEqual({
    present: 4,
    absent: 1,
    halfDay: 1,
    leave: 1,
    rate: '71.4',
  });
  expect(records.find(record => record.date === '2026-10-07')).toMatchObject({
    checkIn: '09:03 AM',
    checkOut: '06:02 PM',
    source: 'QR',
    verified: true,
  });
  expect(
    attendanceSummary(records.filter(record => record.status === 'absent')),
  ).toEqual({ present: 0, absent: 1, halfDay: 0, leave: 0, rate: '0.0' });
  expect(attendanceForPeriod({ year: 2026, month: 10 })).toEqual([]);
  expect(attendanceSummary([]).rate).toBe('0.0');
});

test('payroll deducts absences once and exports the selected period and edited employee', () => {
  const payroll = payrollForPeriod({ year: 2026, month: 9 });
  expect(payroll).toMatchObject({
    monthlySalary: 15000,
    earnedSalary: 13750,
    absentDeduction: 1250,
    advanceDeduction: 1000,
    netPayable: 12750,
  });
  expect(payroll.netPayable).toBe(
    payroll.monthlySalary - payroll.absentDeduction - payroll.advanceDeduction,
  );
  const report = salaryReport(
    { year: 2026, month: 0 },
    { ...DEFAULT_EMPLOYEE, name: 'Edited Employee' },
  );
  expect(report.subtitle).toBe('January 2026');
  expect(report.employee).toContain('Edited Employee');
  expect(
    report.sections[1].rows.find(row => row.label === 'Net Payable')?.value,
  ).toBe('₹13,135');
  expect(payrollForPeriod({ year: 2027, month: 0 })).toMatchObject({
    available: false,
    netPayable: 0,
  });
});
