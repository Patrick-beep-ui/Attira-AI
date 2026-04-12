import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import { MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, getStylePreferences, canUpdatePersonalData, canUpdateStyleData, updatePersonalData, PersonalDataUpdateResult, StyleUpdateResult } from "@/services/profile-service";

type CountryData = { iso2: string; country: string; cities: string[] };
type CountryItem = { code: string; name: string };

const fitPreferences = ["Tight", "Regular", "Relaxed", "Oversized"];
const stylePreferences = ["Minimalist", "Streetwear", "Business Casual", "Elegant", "Sporty"];

const centerAmericanCodes = ["BZ","CR","SV","GT","HN","NI","PA"];

export default function BodyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [personalCooldown, setPersonalCooldown] = useState<PersonalDataUpdateResult | null>(null);
  const [styleCooldown, setStyleCooldown] = useState<StyleUpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    bodyType: "",
    height: "",
    weight: "",
    fit: "",
    city: "",
    countryCode: "",
    timezone: "",
    latitude: null as number | null,
    longitude: null as number | null,
    styles: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    
    async function loadProfile() {
      const data = await getProfile(user.id);
      if (!data) {
        navigate("/profile-setup");
        return;
      }
      
      const styles = await getStylePreferences(data.id);
      const pCD = await canUpdatePersonalData(user.id);
      const sCD = await canUpdateStyleData(user.id);
      
      setProfile({
        bodyType: data.body_type || "",
        height: data.height_cm?.toString() || "",
        weight: data.weight_kg?.toString() || "",
        fit: data.preferred_fit || "",
        city: data.city || "",
        countryCode: data.country_code || "",
        timezone: data.timezone || "",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        styles,
      });
      
      setPersonalCooldown(pCD);
      setStyleCooldown(sCD);
      setLoading(false);
    }
    
    loadProfile();
  }, [user, navigate]);

  useEffect(() => {
    const fetchCountries = async () => {
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
        setLocationLoading(false);
      }
    };
    
    if (allCountries.length === 0) {
      fetchCountries();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profile.countryCode) {
      setCities([]);
      setFilteredCities([]);
      return;
    }
    
    const countryData = allCountries.find((c) => c.iso2 === profile.countryCode);
    if (countryData) {
      const sortedCities = [...countryData.cities].sort();
      setCities(sortedCities);
      setFilteredCities(sortedCities);
    }
  }, [profile.countryCode, allCountries]);

  const handleCitySearch = (value: string) => {
    setProfile((p) => ({ ...p, city: value }));
    if (!value.trim()) {
      setFilteredCities(cities);
    } else {
      const lowerValue = value.toLowerCase();
      setFilteredCities(cities.filter((c) => c.toLowerCase().includes(lowerValue)));
    }
  };

  const selectCity = (selectedCity: string) => {
    setProfile((p) => ({ ...p, city: selectedCity }));
    setShowCityDropdown(false);
    cityInputRef.current?.blur();
  };

  const getCountryName = (code: string) => {
    const country = filteredCountries.find((c) => c.code === code);
    return country?.name || code;
  };

  const toggleStyle = (s: string) => {
    setProfile((p) => ({
      ...p,
      styles: p.styles.length >= 2 && !p.styles.includes(s)
        ? p.styles
        : p.styles.includes(s)
          ? p.styles.filter((x) => x !== s)
          : [...p.styles, s],
    }));
  };

  const canSave = profile.fit && (profile.styles.length > 0 || (personalCooldown?.canUpdate && (profile.height || profile.weight || profile.city)));

  const handleSave = async () => {
    if (!user) return;
    
    setShowDisclaimer(true);
  };

  const confirmSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    const hasPersonalChanges = !!profile.height || !!profile.weight || !!profile.city;
    const hasStyleChanges = !!profile.fit || profile.styles.length > 0;
    
    if (hasPersonalChanges && !personalCooldown?.canUpdate) {
      setError(`Personal data can only be updated once per 7 days. ${personalCooldown?.daysRemaining} days remaining.`);
      setSaving(false);
      return;
    }
    
    if (hasStyleChanges && !styleCooldown?.canUpdate) {
      setError(`Style preferences can only be updated once per 24 hours. ${styleCooldown?.hoursRemaining} hours remaining.`);
      setSaving(false);
      return;
    }
    
    const result = await updatePersonalData(user.id, {
      height_cm: profile.height ? Number(profile.height) : undefined,
      weight_kg: profile.weight ? Number(profile.weight) : undefined,
      preferred_fit: profile.fit as "tight" | "regular" | "relaxed" | "oversized",
      city: profile.city || undefined,
      country_code: profile.countryCode || undefined,
      latitude: profile.latitude ?? undefined,
      longitude: profile.longitude ?? undefined,
      timezone: profile.timezone || undefined,
      style_preferences: profile.styles,
    });
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/home"), 1500);
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showDisclaimer) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background px-6 pb-12 pt-16">
        <div className="space-y-6">
          <h2 className="font-display text-display-2 text-foreground">Update Profile?</h2>
          
          <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="text-body-sm text-yellow-600 dark:text-yellow-400">
              <strong>Note:</strong> Personal data (height, weight, location) can only be updated once every 7 days. Style preferences (fit, styles) can be updated once every 24 hours. Your body type is permanent and cannot be changed.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-body text-muted-foreground">Your changes:</p>
            <ul className="text-body-sm space-y-1 text-foreground">
              {profile.height && <li>Height: {profile.height} cm</li>}
              {profile.weight && <li>Weight: {profile.weight} kg</li>}
              {profile.fit && <li>Preferred Fit: {profile.fit}</li>}
              {profile.city && <li>Location: {profile.city}</li>}
              {profile.styles.length > 0 && <li>Styles: {profile.styles.join(", ")}</li>}
            </ul>
          </div>
          
          {error && (
            <p className="text-body-sm text-red-500">{error}</p>
          )}
          
          {success && (
            <p className="text-body-sm text-green-500">Profile updated successfully!</p>
          )}
        </div>
        
        <div className="flex gap-3 pt-8">
          <Button variant="outline" onClick={() => setShowDisclaimer(false)} className="flex-1 rounded-xl py-6">
            Cancel
          </Button>
          {!success && (
            <Button onClick={confirmSave} disabled={saving} className="flex-1 rounded-xl py-6 text-body font-medium">
              {saving ? "Saving..." : "Confirm"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-6 pb-12 pt-16">
      <div className="mb-6">
        <h1 className="font-display text-display-2 text-foreground">Edit Profile</h1>
        <p className="mt-1 text-body text-muted-foreground">Update your personal information.</p>
        <p className="mt-3 text-body-sm text-muted-foreground italic">
          Keeping your info accurate helps us personalize outfits that fit your unique style and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-body-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-green-500/50 bg-green-500/10 p-4">
          <p className="text-body-sm text-green-500">Profile updated successfully!</p>
        </div>
      )}

      <div className="flex-1 space-y-8 overflow-y-auto">
        <div className="space-y-3">
          <p className="text-body-sm font-medium text-foreground">Body Type <span className="text-red-500">*</span></p>
          <p className="text-body-sm text-muted-foreground">{profile.bodyType || "Not set"}</p>
          <p className="text-body-xs text-muted-foreground">Body type is permanent and cannot be changed.</p>
        </div>

        <div className="space-y-3">
          <p className="text-body-sm font-medium text-foreground">Measurements</p>
          <input
            className="rounded-xl border border-border bg-card w-full py-3 px-3"
            value={profile.height}
            onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
            placeholder="Height (cm)"
            type="number"
          />
          <input
            className="rounded-xl border border-border bg-card w-full py-3 px-3"
            value={profile.weight}
            onChange={(e) => setProfile((p) => ({ ...p, weight: e.target.value }))}
            placeholder="Weight (kg)"
            type="number"
          />
          {!personalCooldown?.canUpdate && personalCooldown?.lastUpdate && (
            <p className="text-body-xs text-muted-foreground">
              Personal data can be updated in {personalCooldown.daysRemaining} days.
            </p>
          )}
          {!styleCooldown?.canUpdate && styleCooldown?.lastUpdate && (
            <p className="text-body-xs text-muted-foreground">
              Style preferences can be updated in {styleCooldown.hoursRemaining} hours.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-body-sm font-medium text-foreground">Preferred Fit</p>
          <div className="flex flex-wrap gap-2">
            {fitPreferences.map((f) => (
              <TagChip
                key={f}
                label={f}
                active={profile.fit === f}
                onClick={() => setProfile((p) => ({ ...p, fit: f }))}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-body-sm font-medium text-foreground">Style Preferences (max 2)</p>
          <div className="flex flex-wrap gap-2">
            {stylePreferences.map((s) => (
              <TagChip
                key={s}
                label={s}
                active={profile.styles.includes(s)}
                onClick={() => toggleStyle(s)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-body-sm font-medium text-foreground">Location</p>
          
          <select
            value={profile.countryCode}
            onChange={(e) => {
              setProfile((p) => ({ ...p, countryCode: e.target.value, city: "", latitude: null, longitude: null }));
            }}
            className="rounded-xl border border-border bg-card w-full py-3 px-3 text-body"
          >
            <option value="">Select country</option>
            {filteredCountries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          
          <div ref={cityDropdownRef} className="relative">
            <input
              ref={cityInputRef}
              type="text"
              value={profile.city}
              onChange={(e) => {
                handleCitySearch(e.target.value);
                setProfile((p) => ({ ...p, latitude: null, longitude: null }));
              }}
              onFocus={() => profile.countryCode && setShowCityDropdown(true)}
              placeholder={profile.countryCode ? "Search or select city" : "Select country first"}
              disabled={!profile.countryCode}
              className="w-full rounded-xl border border-border bg-card py-3 px-3 text-body"
            />
            {showCityDropdown && profile.countryCode && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCities.slice(0, 50).map((c, i) => (
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
          
          <button
            type="button"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setProfile((p) => ({
                    ...p,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  }));
                },
                () => {}
              );
            }}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-border bg-card text-body-sm text-muted-foreground hover:text-foreground hover:border-gray-400 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Use my current location
          </button>
          
          {profile.latitude && profile.longitude && (
            <p className="text-body-xs text-muted-foreground">
              Location set: {profile.latitude.toFixed(2)}, {profile.longitude.toFixed(2)}
            </p>
          )}
          
          {(profile.latitude === null || profile.longitude === null) && profile.city && (
            <p className="text-body-xs text-yellow-600">
              Tip: Enable location for accurate weather-based outfits
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button variant="outline" onClick={() => navigate("/settings")} className="flex-1 rounded-xl py-6">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave} className="flex-1 rounded-xl py-6 text-body font-medium">
          Save Changes
        </Button>
      </div>
    </div>
  );
}