import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/profile-service";

import StepIntro from "@/components/setup/StepIntro";
import StepPhysical from "@/components/setup/StepPhysical";
import StepStyle from "@/components/setup/StepStyle";
import StepLocation from "@/components/setup/StepLocation";
import StepGeo from "@/components/setup/StepGeo";
import StepReview from "@/components/setup/StepReview";

import { toast } from "sonner";

export default function ProfileSetup() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState<any>({
    physical: {},
    style: {},
    location: {},
    geo: {},
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const update = (section: string, data: any) => {
    setState((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const payload = {
      ...state.physical,
      ...state.style,
      ...state.location,
      ...state.geo,
    };

    console.log("FINAL PROFILE PAYLOAD:", payload);

    const { error } = await updateUserProfile(user.id, payload);

    if (error) return toast.error(error.message);

    toast.success("Profile completed");
    navigate("/home");
  };

  const steps = [
    <StepIntro onNext={next} />,
    <StepPhysical data={state.physical} onNext={update} next={next} />,
    <StepStyle data={state.style} onNext={update} next={next} back={back} />,
    <StepLocation data={state.location} onNext={update} next={next} back={back} />,
    <StepGeo data={state.geo} onNext={update} next={next} back={back} />,
    <StepReview data={state} onSubmit={handleSubmit} back={back} />,
  ];

return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10">
      
      {/* Animated Step */}
      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? "bg-primary w-8" : "bg-muted w-4"
            }`}
          />
        ))}
      </div>
    </div>
  );
}