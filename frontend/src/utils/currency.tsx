import { CurrencyType } from "@/redux/store";
import {
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  IndianRupee,
} from "lucide-react";

export const getCurrencySymbol = (currency: CurrencyType): string => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    case "INR":
      return "₹";
    default:
      return "$";
  }
};

export const CurrencyIcon: React.FC<{
  currency: CurrencyType;
  className?: string;
  size?: number;
}> = ({ currency, className, size = 20 }) => {
  switch (currency) {
    case "USD":
      return <DollarSign className={className} size={size} />;
    case "EUR":
      return <Euro className={className} size={size} />;
    case "GBP":
      return <PoundSterling className={className} size={size} />;
    case "JPY":
      return <JapaneseYen className={className} size={size} />;
    case "INR":
      return <IndianRupee className={className} size={size} />;
    default:
      return <DollarSign className={className} size={size} />;
  }
};
