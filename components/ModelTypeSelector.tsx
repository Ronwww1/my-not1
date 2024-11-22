#блин это бдеть странится
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaMale, FaFemale, FaRainbow } from "react-icons/fa";

export function ModelTypeSelector() {
  return (
    <RadioGroup defaultValue="genderMale" className="grid grid-cols-3 gap-4">
      <div>
        <RadioGroupItem
          value="genderMale"
          id="gender-male"
          className="peer sr-only"
          aria-label="gender-male"
        />
        <Label
          htmlFor="gender-male"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <FaMale className="mb-3 h-6 w-6" />
          Male
        </Label>
      </div>

      <div>
        <RadioGroupItem
          value="genderFemale"
          id="gender-female"
          className="peer sr-only"
          aria-label="gender-female"
        />
        <Label
          htmlFor="gender-female"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <FaFemale className="mb-3 h-6 w-6" />
          Female
        </Label>
      </div>
      <div>
        <RadioGroupItem
          value="genderUnisex"
          id="gender-unisex"
          className="peer sr-only"
          aria-label="gender-unisex"
        />
        <Label
          htmlFor="gender-unisex"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <FaRainbow className="mb-3 h-6 w-6" />
          Unisex
        </Label>
      </div>
    </RadioGroup>
  );
}
