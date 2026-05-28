import { SidebarProvider } from '@/context/SidebarContext';
import AdminLayoutInner from './AdminLayoutInner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
