import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, CurrencyType } from "@/redux/store";
import { login } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { readParticipants } from "@/redux/slices/participantSlice";
import { readExpenses } from "@/redux/slices/expenseSlice";

type LoginFormProps = {
  onToggleForm: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { userLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      await dispatch(readParticipants()).unwrap();
      await dispatch(readExpenses()).unwrap();
      toast.success(`${response.user.email} logged in successfully`);
    } catch (err) {
      console.error(err);
      toast(err);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">
          Log in to track your trip expenses
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

        <Button
          type="submit"
          className="w-full bg-expense hover:bg-expense-dark"
          disabled={userLoading}
        >
          {userLoading ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-expense hover:underline font-medium inline-flex items-center"
            >
              Register <ArrowRight size={16} className="ml-1" />
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
