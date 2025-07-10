import { User, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Role = () => {
  const navigate = useNavigate();

  const handleSelect = (role: "client" | "therapist") => {
    navigate("/auth", { state: { role } });
  };
  
 
  return (
    <div className="rounded-xl p-6 flex flex-col md:flex-row justify-center items-center gap-6">
      <div 
        className="flex flex-col items-center p-4 w-32 cursor-pointer rounded-lg transition border border-white hover:bg-[oklch(0.68_0.15_195)]"
        onClick={() => handleSelect("client")}
      >
        <User size={40} className="text-white mb-2" />
        <p className="text-white font-medium">Client</p>
      </div>

      <div 
        className="flex flex-col items-center p-4 w-32 cursor-pointer rounded-lg transition border border-white hover:bg-[oklch(0.68_0.15_195)]"
        onClick={() => handleSelect("therapist")}
      >
        <Stethoscope size={40} className="text-white mb-2" />
        <p className="text-white font-medium">Therapist</p>
      </div>
    </div>
  );
};

export default Role;