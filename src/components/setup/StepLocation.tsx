import { useEffect, useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CountryItem = { code: string; name: string };
type CountryData = { iso2: string; country: string; cities: string[] };

export default function StepLocation({ onNext, next, back }: any) {
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryItem[]>([]);
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const centerAmericanCodes = ["BZ","CR","SV","GT","HN","NI","PA"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/Countries");
        const data = await res.json();

        if (data.data) {
          const countryList = data.data
            .filter((c: any) => centerAmericanCodes.includes(c.iso2))
            .map((c: any) => ({
              iso2: c.iso2,
              country: c.country,
              cities: c.cities || [],
            }));
          setAllCountries(countryList);
          setFilteredCountries(countryList.map((c) => ({ code: c.iso2, name: c.country })));
        }
      } catch {
        setFilteredCountries(centerAmericanCodes.map((code) => ({ code, name: code })));
      } finally {
        setLoading(false);
      }
    };

    if (allCountries.length === 0) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!country) {
      setCities([]);
      setFilteredCities([]);
      setCity("");
      return;
    }

    const countryData = allCountries.find((c) => c.iso2 === country);
    if (countryData) {
      const sortedCities = [...countryData.cities].sort();
      setCities(sortedCities);
      setFilteredCities(sortedCities);
    }
  }, [country, allCountries]);

  const handleCitySearch = (value: string) => {
    setCity(value);
    if (!value.trim()) {
      setFilteredCities(cities);
    } else {
      const lowerValue = value.toLowerCase();
      setFilteredCities(cities.filter((c) => c.toLowerCase().includes(lowerValue)));
    }
  };

  const selectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

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
          <Select value={country} onValueChange={(val) => {
            setCountry(val);
            setCity("");
            setFilteredCities([]);
            setShowDropdown(false);
          }}>
            <SelectTrigger className="w-full"><SelectValue placeholder={loading ? "Loading..." : "Select country"} /></SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                filteredCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div ref={dropdownRef} className="relative">
          <Label>City</Label>
          <input
            ref={inputRef}
            type="text"
            placeholder={country ? "Search or select city" : "Select country first"}
            value={city}
            onChange={(e) => handleCitySearch(e.target.value)}
            onFocus={() => country && setShowDropdown(true)}
            disabled={!country}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {showDropdown && country && filteredCities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredCities.map((c, i) => (
                <div
                  key={`${c}-${i}`}
                  onClick={() => selectCity(c)}
                  className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={back} className="px-4 py-2 rounded">Back</button>
        <button onClick={handle} className="px-4 py-2 rounded bg-primary text-white" disabled={!canNext}>Continue</button>
      </div>
    </div>
  );
}
