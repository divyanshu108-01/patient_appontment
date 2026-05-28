import { SidebarProvider } from '@/context/SidebarContext';
import PatientLayoutInner from './PatientLayoutInner';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PatientLayoutInner>{children}</PatientLayoutInner>
    </SidebarProvider>
  );
}
