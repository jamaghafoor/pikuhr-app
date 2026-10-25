import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { DEFAULT_EMPLOYEE, type Employee } from '../data/demo';
import { loadEmployee, saveEmployee } from '../services/device';

const EmployeeContext = createContext({
  employee: DEFAULT_EMPLOYEE,
  ready: false,
  save: async (_employee: Employee) => {},
});
export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState(DEFAULT_EMPLOYEE);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    loadEmployee()
      .then(saved => {
        if (mounted && saved) {
          setEmployee({ ...DEFAULT_EMPLOYEE, ...saved });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  const save = async (updated: Employee) => {
    await saveEmployee(updated);
    setEmployee(updated);
  };
  return (
    <EmployeeContext.Provider value={{ employee, ready, save }}>
      {children}
    </EmployeeContext.Provider>
  );
}
export const useEmployee = () => useContext(EmployeeContext);
