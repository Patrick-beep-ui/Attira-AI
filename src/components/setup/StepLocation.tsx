import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CountryItem = { code: string; name: string };

export default function StepLocation({ onNext, next, back }: any) {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [country, setCountry] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const centerAmericanCodes = ["BZ","CR","SV","GT","HN","NI","PA"];

  useEffect(() => {
    // Fetch central american countries from REST Countries and filter to our subset
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
        const data = await res.json();

        const list = (data || [])
          .filter((c: any) => centerAmericanCodes.includes((c?.cca2 || '').toString()))
          .map((c: any) => ({ code: c.cca2, name: c.name?.common || c.name?.official || c.name }));
        setCountries(list as CountryItem[]);
        setLoading(false);

      } catch {
        // Fallback static set
        setLoading(false);
        setCountries(centerAmericanCodes.map((code)=>({ code, name: code })));
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!country) return;
    // Basic city mapping per country (could be replaced with API later)
    const map: Record<string, string[]> = {
      NI: ["Managua","León","Masaya"],
      GT: ["Guatemala City","Mixco","Villa Nueva"],
      CR: ["San Jose","Alajuela"],
      SV: ["San Salvador","Santa Ana"],
      HN: ["Tegucigalpa","San Pedro Sula"],
      PA: ["Panama City","David"],
      BZ: ["Belmopan","Belize City"],
    };
    setCities(map[country] ?? []);
    setCity( (map[country]?.[0]) ?? "" );
  }, [country]);

  const canNext = !!country && !!city;

  const handle = () => {
    if (!country || !city) return;
    onNext("location", { country_code: country, city });
    next();
  };

  return (
    <div>
      <h1>Location</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Country</Label>
          <Select value={country} onValueChange={(val) => setCountry(val)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>City</Label>
          <Select value={city} onValueChange={(val) => setCity(val)} disabled={!country}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              {cities.map((ct) => (
                <SelectItem key={ct} value={ct}>{ct}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={back} className="px-4 py-2 rounded">Back</button>
        <button onClick={handle} className="px-4 py-2 rounded bg-primary text-white" disabled={!canNext}>Continue</button>
      </div>
    </div>
  );
}
