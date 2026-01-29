import { useAuth } from "@/contexts/auth.context";
import { BarChart3, Calendar, Clock, MessageCircle, Star, User, Wallet } from "lucide-react";

export const useTherapistSidebarConfig = () => {
  const { user } = useAuth();

  const profileHref =
    user?.approvalStatus === "Pending"
      ? "/therapist/profile/verification"
      : "/therapist/profile";

  return {
    subtitle: "Therapist Dashboard",
    navigation: [
      {
        name: "Dashboard",
        to: "/therapist/dashboard",
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
       name: 'Slot Management',
       to: "/therapist/slots",
       icon: <Clock className="w-5 h-5"/> 
      },
      {
        name: 'Appoinments',
        to: '/therapist/appointments',
        icon: <Calendar className="w-5 h-5"/> 
      },
      {
        name: 'Review & Rating',
        to: '/therapist/reviews',
        icon: <Star className="w-5 h-5"/> 
      },
      {
        name: 'Messages',
        to: '/therapist/chat',
        icon: <MessageCircle className="w-5 h-5"/> 
      },
      {
        name: "Wallet",
        to: '/therapist/wallet',
        icon: <Wallet className="w-5 h-5"/>
      },
      {
        name: "Profile",
        to: profileHref,
        icon: <User className="w-5 h-5" />,
      },
    ],
  };
};