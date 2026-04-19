import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  isValidHex,
  normalizeHex,
  getColorNameFromHex,
  getColorFromName,
} from "@/lib/colorUtils";

interface ColorPickerProps {
  value: string;
  onChange: (colorName: string) => void;
  detectedHex?: string | null;
  onDetectFromImage?: () => void;
  label?: string;
  showDetectButton?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  detectedHex,
  onDetectFromImage,
  label = "Color",
  showDetectButton = false,
}: ColorPickerProps) {
  const { t } = useLanguage();
  const [hexValue, setHexValue] = useState<string>("#000000");
  const [colorNameInput, setColorNameInput] = useState<string>("");
  const [warning, setWarning] = useState<string | null>(null);

  /**
   * Sync external value → internal state (ALWAYS)
   */
  useEffect(() => {
    if (value) {
      const hex = getColorFromName(value);

      if (hex) {
        setHexValue(hex);
        setColorNameInput(value);
      } else {
        setColorNameInput(value);
      }
    } else {
      setColorNameInput("");
    }
  }, [value]);

  /**
   * Auto-set from detected image color (optional)
   */
  useEffect(() => {
    if (detectedHex) {
      try {
        const normalized = normalizeHex(detectedHex);
        setHexValue(normalized);

        const name = getColorNameFromHex(normalized);

        if (name) {
          onChange(name);
          setColorNameInput(name);
          setWarning(null);
        } else {
          onChange(normalized);
          setColorNameInput(normalized);
        }
      } catch (err) {
        console.error("Error detecting color:", err);
      }
    }
  }, [detectedHex]);

  /**
   * HEX input handler
   */
  const handleHexChange = (newHex: string) => {
    setHexValue(newHex);

    if (isValidHex(newHex)) {
      const normalized = normalizeHex(newHex);
      const name = getColorNameFromHex(normalized);

      if (name) {
        onChange(name);
        setColorNameInput(name);
        setWarning(null);
      } else {
        onChange(normalized);
        setColorNameInput(normalized);
        setWarning(t("wardrobe.no_exact_name_found"));
      }
    } else {
      setWarning(t("wardrobe.invalid_hex_format"));
    }
  };

  /**
   * Name input handler
   */
  const handleNameChange = (name: string) => {
    setColorNameInput(name);

    if (name.trim() === "") {
      setWarning(null);
      onChange("");
      return;
    }

    const hex = getColorFromName(name);

    if (hex) {
      setHexValue(hex);
      setWarning(null);
      onChange(name);
    } else {
      setWarning(`"${name}" ${t("wardrobe.not_recognized")}`);
      onChange(name);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-body-sm">
        {label} <span className="text-muted-foreground">{t("wardrobe.optional")}</span>
      </Label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0"
        />

        <Input
          type="text"
          placeholder={t("wardrobe.color_placeholder")}
          value={colorNameInput}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 rounded-xl"
        />
      </div>

      {warning && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{warning}</span>
        </div>
      )}

      {detectedHex && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Palette className="h-4 w-4" />
          <span>
            {t("wardrobe.detected")}{" "}
            <span style={{ color: detectedHex }}>{colorNameInput}</span>
          </span>
        </div>
      )}

      {showDetectButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDetectFromImage}
          className="w-full rounded-xl"
        >
          <Palette className="h-4 w-4 mr-2" />
          {t("wardrobe.detect_color_from_image")}
        </Button>
      )}
    </div>
  );
}