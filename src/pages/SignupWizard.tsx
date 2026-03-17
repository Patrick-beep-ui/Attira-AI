import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/services/profile-service";
import type { CreateUserProfileDTO } from "@/services/profile-service";

type Step = 1 | 2 | 3 | 4 | 5;

export default function SignupWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const initial = (location.state as { email?: string; password?: string }) ?? {};

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState<string>(initial.email || "");
  const [password, setPassword] = useState<string>(initial.password || "");
  const [height, setHeight] = useState<number | ''>("" as any);
  const [weight, setWeight] = useState<number | ''>("" as any);
  const [bodyType, setBodyType] = useState<CreateUserProfileDTO["body_type"]>("athletic");
  const [fit, setFit] = useState<CreateUserProfileDTO["preferred_fit"]>("regular");
  const [country, setCountry] = useState<string>("NI");
  const [city, setCity] = useState<string>("Managua");
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const COUNTRIES = [
    { label: "Nicaragua", value: "NI" },
    { label: "United States", value: "US" },
  ];
  const CITIES: Record<string, string[]> = { NI: ["Managua"], US: ["New York", "Los Angeles"] };

  const isStep1Valid = (): boolean => !!email && !!password;
  const isStep2Valid = (): boolean => height !== "" && height >= 120 && height <= 220 && weight !== "" && weight >= 35 && weight <= 200;
  const isStep3Valid = (): boolean => !!country && !!city;

  const next = () => setStep((s) => (s === 1 ? 2 : (s === 2 ? 3 : (s === 3 ? 4 : 5)) as any));
  const prev = () => setStep((s) => (s > 1 ? (s - 1) : s) as any);

  const handleSubmit = async () => {
    // Submit final data: create account, sign in, then save profile
    if (!isStep1Valid()) { toast.error("Please enter email and password"); return; }
    if (!isStep2Valid()) { toast.error("Please complete height/weight"); return; }
    if (!isStep3Valid()) { toast.error("Please set location"); return; }

    try {
      // Create account
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;
      // Sign in
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      // Persist profile with normalized data
      const dto: CreateUserProfileDTO = {
        height_cm: Number(height),
        weight_kg: Number(weight),
        body_type: bodyType,
        preferred_fit: fit,
        country_code: country.toUpperCase(),
        city,
        timezone
      };
      // @ts-ignore
      await createUserProfile(user!.id, dto);
      navigate("/home");
    } catch (e: any) {
      toast.error(e?.message || "Signup failed");
    }
  };

  const StepAccount = () => (
    <div className="space-y-3">
      <Label>Email</Label>
      <Input value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" />
      <Label>Password</Label>
      <Input value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="Password" type="password" />
    </div>
  );

  const StepPhysical = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Height (cm)</Label>
        <Input type="number" min={120} max={220} value={height} onChange={(e)=> setHeight(Number(e.target.value))} />
      </div>
      <div>
        <Label>Weight (kg)</Label>
        <Input type="number" min={35} max={200} value={weight} onChange={(e)=> setWeight(Number(e.target.value))} />
      </div>
    </div>
  );

  const StepStyle = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Body Type</Label>
        <Select value={bodyType} onValueChange={(v)=> setBodyType(v as any)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select body type" /></SelectTrigger>
          <SelectContent>
            {(["ectomorph","mesomorph","endomorph","athletic","average"] as const).map((v)=> (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Preferred Fit</Label>
        <Select value={fit} onValueChange={(v)=> setFit(v as any)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select fit" /></SelectTrigger>
          <SelectContent>
            {(["tight","regular","relaxed","oversized"] as const).map((v)=> (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const StepLocation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Country</Label>
        <Select value={country} onValueChange={(v)=> setCountry(v as string)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c)=> (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>City</Label>
        <Select value={city} onValueChange={(v)=> setCity(v as string)}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {CITIES[country]?.map((c)=> (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <AppShell>
      <HeaderBar title="Signup" showBack />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="text-lg font-semibold">Create your Dressly profile</div>
        {step === 1 && <StepAccount />}
        {step === 2 && <StepPhysical />}
        {step === 3 && <StepStyle />}
        {step === 4 && <StepLocation />}
        {(step === 5) && <StepLocation />}
        <div className="flex justify-between">
          <button disabled={step <= 1} onClick={()=> setStep((s)=> (s-1) as any)} className="px-4 py-2 rounded">Back</button>
          {step < 4 ? (
            <button onClick={()=> setStep((s)=> (s+1) as any)} className="px-4 py-2 rounded bg-primary text-white">Next</button>
          ) : (
            <button onClick={handleSubmit} className="px-4 py-2 rounded bg-green-600 text-white">Submit</button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
