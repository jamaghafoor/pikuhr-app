import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert, NativeModules } from 'react-native';
import App from '../App';
import { DEFAULT_EMPLOYEE } from '../src/data/demo';
import { AuthField } from '../src/screens/auth/AuthLayout';
import { exportPdf, loadEmployee } from '../src/services/device';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

const native = {
  getProfile: jest.fn(),
  saveProfile: jest.fn(),
  exportPdf: jest.fn(),
};
let savedProfile: string | null;
beforeEach(() => {
  jest.clearAllMocks();
  savedProfile = null;
  NativeModules.PikuhrDevice = native;
  native.getProfile.mockImplementation(async () => savedProfile);
  native.saveProfile.mockImplementation(async (json: string) => {
    savedProfile = json;
    return true;
  });
  native.exportPdf.mockResolvedValue({
    cancelled: false,
    filename: 'Report.pdf',
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

async function setup() {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<App />);
  });
  const action = (label: string) =>
    renderer.root.findAll(node => {
      if (
        node.props.accessibilityLabel !== label ||
        typeof node.props.onPress !== 'function'
      ) {
        return false;
      }
      // Mounted offscreen tabs must not participate in user interactions.
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (parent.props.accessibilityElementsHidden) {
          return false;
        }
      }
      return true;
    })[0];
  const tap = async (label: string) => {
    await act(async () => {
      await action(label).props.onPress();
    });
  };
  const input = async (label: string, value: string) => {
    await act(async () => {
      renderer.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onChangeText === 'function',
        )[0]
        .props.onChangeText(value);
    });
  };
  const hasScreen = (id: string) =>
    renderer.root.findAll(node => node.props.testID === id).length > 0;
  const close = () => act(() => renderer.unmount());
  return { renderer, tap, input, action, hasScreen, close };
}

test('salary month filters flow into the salary slip and native PDF; cancelling does not report success', async () => {
  const app = await setup();
  await app.tap('Salary');
  await app.tap('Select month');
  await app.tap('January');
  await app.tap('View Salary Slip');
  expect(app.hasScreen('salary-slip-screen')).toBe(true);
  await app.tap('Download PDF');
  const [filename, json] = native.exportPdf.mock.calls[0];
  expect(filename).toContain('January 2026');
  expect(JSON.parse(json).subtitle).toBe('January 2026');
  expect(
    JSON.parse(json).sections[1].rows.find(
      (row: { label: string }) => row.label === 'Net Payable',
    ).value,
  ).toBe('₹13,135');
  expect(Alert.alert).toHaveBeenCalledWith('PDF saved', expect.any(String));
  jest.mocked(Alert.alert).mockClear();
  native.exportPdf.mockResolvedValueOnce({ cancelled: true });
  await app.tap('Download PDF');
  expect(Alert.alert).not.toHaveBeenCalled();
  await app.tap('Go back');
  await app.tap('Select year');
  await app.tap('2027');
  expect(app.action('View Salary Slip').props.accessibilityState.disabled).toBe(
    true,
  );
  app.close();
});

test('attendance dates, next month, list filters and exports remain in sync', async () => {
  const app = await setup();
  await app.tap('Attendance');
  await app.tap('03 Oct 2026');
  await app.tap('Show attendance list');
  await app.tap('Filter Absent');
  await app.tap('Download Attendance');
  const report = JSON.parse(native.exportPdf.mock.calls[0][1]);
  expect(report.subtitle).toBe('October 2026 | Absent');
  expect(report.sections[1].rows).toHaveLength(1);
  expect(report.sections[1].rows[0].label).toContain('03 Oct 2026');
  expect(
    report.sections[0].rows.find(
      (row: { label: string }) => row.label === 'Present',
    ).value,
  ).toBe('0');
  await app.tap('Show calendar');
  await app.tap('Download Attendance');
  const unfilteredReport = JSON.parse(native.exportPdf.mock.calls[1][1]);
  expect(unfilteredReport.subtitle).toBe('October 2026');
  expect(unfilteredReport.sections[1].rows).toHaveLength(7);
  await app.tap('Next month');
  expect(app.action('Select month').props.accessibilityValue.text).toBe(
    'November',
  );
  expect(
    app.action('Download Attendance').props.accessibilityState.disabled,
  ).toBe(true);
  await app.tap('Previous month');
  await app.tap('Select year');
  await app.tap('2024');
  await app.tap('Select month');
  await app.tap('February');
  expect(app.action('29 Feb 2024')).toBeDefined();
  app.close();
});

test('profile validates, persists and updates the employee shown in later downloads', async () => {
  const app = await setup();
  await app.tap('Profile');
  await app.tap('Edit Profile');
  await app.input('Full Name', '');
  await app.tap('Save Changes');
  expect(native.saveProfile).not.toHaveBeenCalled();
  expect(
    app.renderer.root
      .findAllByType(AuthField)
      .find(field => field.props.label === 'Full Name')?.props.error,
  ).toBe('Enter full name.');
  await app.input('Full Name', ' Asha Sharma ');
  await app.input('Email', 'invalid');
  await app.tap('Save Changes');
  expect(native.saveProfile).not.toHaveBeenCalled();
  await app.input('Email', 'asha@example.com');
  await app.input('Store Name', 'Asha Store');
  await app.tap('Save Changes');
  expect(JSON.parse(savedProfile || '{}')).toMatchObject({
    name: 'Asha Sharma',
    store: 'Asha Store',
    email: 'asha@example.com',
    employeeId: DEFAULT_EMPLOYEE.employeeId,
  });
  expect(app.hasScreen('edit-profile-screen')).toBe(false);
  app.close();
  const relaunched = await setup();
  await relaunched.tap('Salary');
  await relaunched.tap('View Salary Slip');
  await relaunched.tap('Download PDF');
  expect(JSON.parse(native.exportPdf.mock.calls[0][1]).employee).toContain(
    'Asha Sharma',
  );
  relaunched.close();
});

test('failed saves keep the editor open and export failures do not show success', async () => {
  const app = await setup();
  await app.tap('Profile');
  await app.tap('Edit Profile');
  native.saveProfile.mockRejectedValueOnce(new Error('Storage is unavailable'));
  await app.tap('Save Changes');
  expect(app.hasScreen('edit-profile-screen')).toBe(true);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Could not save profile',
    'Storage is unavailable',
  );
  await app.tap('Go back');
  native.exportPdf.mockRejectedValueOnce(new Error('Disk is full'));
  await app.tap('Download Employee Details');
  expect(Alert.alert).toHaveBeenCalledWith('Download failed', 'Disk is full');
  app.close();
});

test('native file names are sanitized and stored profile data cannot replace the employee ID', async () => {
  savedProfile = JSON.stringify({
    name: 'Employee',
    employeeId: 'OTHER-ID',
    email: 42,
  });
  expect(await loadEmployee()).toEqual({ name: 'Employee' });
  await exportPdf('../../Report<>.pdf', {
    title: 'Report',
    subtitle: '',
    employee: '',
    sections: [],
  });
  expect(native.exportPdf.mock.calls[0][0]).not.toContain('/');
  expect(native.exportPdf.mock.calls[0][0]).toMatch(/\.pdf$/);
});
