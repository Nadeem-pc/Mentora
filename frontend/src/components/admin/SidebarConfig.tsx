import { Users, BarChart3, ClipboardList, Wallet, Layers } from 'lucide-react';

export const adminSidebarConfig = {
  subtitle: 'Admin Dashboard',
  navigation: [
    {
      name: 'Dashboard',
      to: '/admin/dashboard',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      name: 'Users',
      to: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      // badge: '24'
    },
    {
      name: 'Job Applications',
      to: '/admin/job-applications',
      icon: <ClipboardList className="w-5 h-5"/>
    },
    {
      name: "Earnings",
      to: '/admin/wallet',
      icon: <Wallet className="w-5 h-5"/>
    },
    {
      name: "Subscription",
      to: '/admin/subscription',
      icon: <Layers className="w-5 h-5"/>
    }
  ]
};