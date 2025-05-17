import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, CurrencyType } from "@/redux/store";
import { register } from "@/redux/slices/authSlice";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type RegisterFormProps = {
  onToggleForm: () => void;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currency, setCurrency] = useState<CurrencyType>("INR");

  const dispatch = useDispatch<AppDispatch>();
  const { userLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords did not match");
      return;
    }

    try {
      const response = await dispatch(
        register({ email, password, currency })
      ).unwrap();
      toast.success(`${response.user.email} registered successfully`);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-muted-foreground mt-1">
          Sign up to start tracking expenses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg"
          />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg"
            minLength={6}
          />
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 cursor-pointer">
            {showPassword ? (
              <Eye
                className="h-5 w-5 ml-2 text-muted-foreground"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <EyeOff
                className="h-5 w-5 ml-2 text-muted-foreground"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="rounded-lg"
            minLength={6}
          />
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 cursor-pointer">
            {showConfirmPassword ? (
              <Eye
                className="h-5 w-5 ml-2 text-muted-foreground"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <EyeOff
                className="h-5 w-5 ml-2 text-muted-foreground"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as CurrencyType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full bg-expense hover:bg-expense-dark"
          disabled={userLoading}
        >
          {userLoading ? <Loader2 className="animate-spin" /> : "Register"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-expense hover:underline font-medium inline-flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" /> Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
