import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { PdfReport } from '../data/demo';
import { exportPdf } from '../services/device';

export function usePdfExport() {
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const download = async (filename: string, report: PdfReport) => {
    if (running.current) {
      return;
    }
    running.current = true;
    setBusy(true);
    try {
      const result = await exportPdf(filename, report);
      if (!result.cancelled) {
        Alert.alert(
          'PDF saved',
          `${result.filename || filename} has been saved to ${
            result.location || 'your selected location'
          }.`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Download failed',
        error instanceof Error
          ? error.message
          : 'The PDF could not be saved. Please try again.',
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return { busy, download };
}
