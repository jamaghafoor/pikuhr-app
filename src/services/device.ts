import { NativeModules } from 'react-native';
import type { Employee, PdfReport } from '../data/demo';

type DeviceModule = {
  getProfile(): Promise<string | null>;
  saveProfile(json: string): Promise<boolean>;
  exportPdf(
    filename: string,
    json: string,
  ): Promise<{
    cancelled: boolean;
    filename?: string;
    uri?: string;
    location?: string;
  }>;
};
function device(): DeviceModule {
  const module = NativeModules.PikuhrDevice as DeviceModule | undefined;
  if (!module) {
    throw new Error(
      'Please rebuild the app to enable saved profiles and PDF downloads.',
    );
  }
  return module;
}
export async function loadEmployee(): Promise<Partial<Employee> | null> {
  if (!NativeModules.PikuhrDevice) {
    return null;
  }
  const json = await device().getProfile();
  if (!json) {
    return null;
  }
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const result: Partial<Employee> = {};
  for (const field of [
    'name',
    'designation',
    'store',
    'mobile',
    'email',
    'city',
  ] as const) {
    if (typeof (parsed as Employee)[field] === 'string') {
      result[field] = (parsed as Employee)[field];
    }
  }
  return result;
}
export function saveEmployee(employee: Employee) {
  return device().saveProfile(JSON.stringify(employee));
}
export function exportPdf(filename: string, report: PdfReport) {
  const safeFilename =
    filename
      .replace(/[^a-zA-Z0-9 _.-]/g, '')
      .slice(0, 110)
      .replace(/\.pdf$/i, '') + '.pdf';
  return device().exportPdf(safeFilename, JSON.stringify(report));
}
