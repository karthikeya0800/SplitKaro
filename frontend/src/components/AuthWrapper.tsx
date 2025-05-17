import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { toggleShowLogin } from "@/redux/slices/authSlice";
import Footer from "./Footer";

export const AuthWrapper: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showLogin } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const toggleForm = () => {
    dispatch(toggleShowLogin());
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>

      <h1 className="text-3xl p-5 font-bold text-foreground ">Split Karo</h1>

      <Card className="w-full max-w-lg p-6 shadow-lg border-border">
        {showLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </Card>
      <Footer />
    </div>
  );
};
