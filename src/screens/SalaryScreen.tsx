import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  ActionButton,
  EmployeeCard,
  EmptyNotice,
  PeriodSelector,
  ScreenHeader,
  Section,
  TileGrid,
  type TileData,
  useTabStyles,
  ValueRow,
} from '../components/TabUI';
import {
  INITIAL_PERIOD,
  displayDate,
  money,
  payrollForPeriod,
  periodLabel,
  salaryReport,
  type Period,
} from '../data/demo';
import { useEmployee } from '../state/EmployeeContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { TabIcon } from '../components/TabAssets';

export type SalaryRoute = 'summary' | 'slip' | 'advance';
type Payroll = ReturnType<typeof payrollForPeriod>;

function attendanceTiles(payroll: Payroll, slip = false): TileData[] {
  const working = {
    label: 'Working Days',
    value: String(payroll.workingDays),
    icon: 'walletBlue' as const,
    background: '#EDF6FE',
  };
  const present = {
    label: 'Present Days',
    value: String(payroll.presentDays),
    icon: 'present' as const,
    background: '#EBFFEB',
    iconWidth: 21,
  };
  const half = {
    label: 'Half Day',
    value: String(payroll.halfDay),
    icon: 'halfDay' as const,
    background: '#FDF8ED',
  };
  const leave = {
    label: 'Leave',
    value: String(payroll.leave),
    icon: 'leave' as const,
    background: '#FEF5EC',
  };
  const absent = {
    label: 'Absent',
    value: String(payroll.absent),
    icon: 'absent' as const,
    background: '#FEEFF1',
  };
  return slip
    ? [working, present, half, leave, absent]
    : [
        {
          label: 'Monthly Salary',
          value: money(payroll.monthlySalary),
          icon: 'walletGreen',
          background: '#F3F2FE',
        },
        working,
        present,
        half,
        leave,
        absent,
      ];
}

function SalaryCalculation({ payroll }: { payroll: Payroll }) {
  const { styles } = useTabStyles();
  return (
    <Section title="Salary Calculation" icon="calculatorWhite">
      <View style={styles.calculation}>
        <View style={styles.calculationRows}>
          <ValueRow label="Earned Salary" value={money(payroll.earnedSalary)} />
          <ValueRow
            label="Absent Deduction"
            value={`-${money(payroll.absentDeduction)}`}
            danger
          />
          <ValueRow
            label="Advance Deduction"
            value={`-${money(payroll.advanceDeduction)}`}
            danger
            last
          />
        </View>
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net Payable</Text>
          <Text style={styles.netLabel}>{money(payroll.netPayable)}</Text>
        </View>
      </View>
    </Section>
  );
}

function PaymentStatus({
  payroll,
  slip = false,
}: {
  payroll: Payroll;
  slip?: boolean;
}) {
  const { styles, scale } = useTabStyles();
  return (
    <Section title="Payment Status" icon="cardWhite">
      {slip && (
        <View style={styles.paidBanner}>
          <TabIcon name="paidCheck" size={24 * scale} />
          <View style={styles.paidBannerCopy}>
            <Text style={styles.paidBannerTitle}>
              {payroll.available ? 'Paid' : 'Not available'}
            </Text>
            <Text style={styles.paidBannerDescription}>
              {payroll.available
                ? 'Your Salary has been paid successfully'
                : 'No payment for this period'}
            </Text>
          </View>
        </View>
      )}
      <TileGrid
        items={[
          {
            label: 'Paid On',
            value: payroll.paidOn ? displayDate(payroll.paidOn) : '—',
            icon: slip ? 'calendarPurple' : 'paidCheck',
            background: '#F3F2FE',
            valueSize: 16,
          },
          {
            label: 'Payment Mode',
            value: payroll.paymentMode,
            icon: 'cardBlue',
            background: '#EDF6FE',
            valueSize: 16,
          },
        ]}
      />
    </Section>
  );
}

export function SalaryScreen({
  route,
  onRoute,
}: {
  route: SalaryRoute;
  onRoute: (route: SalaryRoute) => void;
}) {
  const [period, setPeriod] = useState<Period>(INITIAL_PERIOD);
  const { employee } = useEmployee();
  const { styles } = useTabStyles();
  const payroll = payrollForPeriod(period);
  const { busy, download } = usePdfExport();
  if (route === 'advance') {
    const report = {
      title: 'Advance Details',
      subtitle: 'October 2026',
      employee: `${employee.name} | ${employee.employeeId}\n${employee.store}`,
      sections: [
        {
          title: 'Advance Summary',
          rows: [
            { label: 'Advance issued', value: money(6000) },
            { label: 'Recovered', value: money(1000) },
            { label: 'Outstanding', value: money(5000) },
            { label: 'Monthly EMI', value: money(1000) },
            { label: 'Remaining instalments', value: '5' },
          ],
        },
      ],
      note: 'Demo advance statement. No financial transaction is performed.',
    };
    return (
      <View style={styles.screen} testID="advance-screen">
        <ScreenHeader
          title="Advance Details"
          onBack={() => onRoute('summary')}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Section title="Advance Summary" icon="calculatorWhite">
            <View style={styles.calculationRows}>
              {report.sections[0].rows.map((row, index) => (
                <ValueRow key={row.label} {...row} last={index === 4} />
              ))}
            </View>
          </Section>
          <Section title="Recovery History" icon="calendarSummary">
            <View style={styles.calculationRows}>
              <ValueRow label="01 Oct 2026" value={money(1000)} last />
            </View>
          </Section>
          <ActionButton
            label="Download Statement"
            download
            busy={busy}
            onPress={() =>
              download(`Advance Statement - ${employee.name}.pdf`, report)
            }
          />
        </ScrollView>
      </View>
    );
  }
  const slip = route === 'slip';
  return (
    <View
      style={styles.screen}
      testID={slip ? 'salary-slip-screen' : 'salary-screen'}
    >
      <ScreenHeader
        title={slip ? 'Salary Slip' : 'My Salary'}
        onBack={slip ? () => onRoute('summary') : undefined}
      />
      <ScrollView
        key={route}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {slip && (
          <>
            <View style={styles.slipPeriod}>
              <Text style={styles.slipPeriodTitle}>{periodLabel(period)}</Text>
              <Text style={styles.slipPeriodLabel}>Salary Slip</Text>
            </View>
            <EmployeeCard employee={employee} />
          </>
        )}
        <Section
          title={slip ? 'Attendance Summary' : 'Salary Summary'}
          icon={slip ? 'calendarSummary' : 'pie'}
          action={
            !slip && <PeriodSelector period={period} onChange={setPeriod} />
          }
        >
          <TileGrid items={attendanceTiles(payroll, slip)} />
          {!payroll.available && (
            <EmptyNotice>
              No salary record is available for {periodLabel(period)}. Try
              October 2026 or an earlier month.
            </EmptyNotice>
          )}
        </Section>
        <SalaryCalculation payroll={payroll} />
        <PaymentStatus payroll={payroll} slip={slip} />
        <ActionButton
          label={slip ? 'Download PDF' : 'View Salary Slip'}
          download
          busy={busy}
          disabled={!payroll.available}
          onPress={() =>
            slip
              ? download(
                  `Salary Slip - ${employee.name} - ${periodLabel(period)}.pdf`,
                  salaryReport(period, employee),
                )
              : onRoute('slip')
          }
        />
      </ScrollView>
    </View>
  );
}
