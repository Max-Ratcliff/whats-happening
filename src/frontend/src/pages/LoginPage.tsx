
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";

/**
 * Login page for the application
 * Handles user authentication with UCSC email
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Email validation for UCSC domain
    if (!email.endsWith("@ucsc.edu")) {
      toast.error("Please use your UCSC email address (@ucsc.edu)");
      setIsLoading(false);
      return;
    }

    // Simulate authentication
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo purposes, allow any valid UCSC email format
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ucscBlue to-blue-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <Logo className="h-16 w-auto" />
          <div className="text-center">
            <CardTitle className="text-2xl">Welcome to SlugScene</CardTitle>
            <CardDescription>
              Sign in with your UCSC credentials to continue
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email (@ucsc.edu)
              </label>
              <Input
                id="email"
                type="email"
                placeholder="slug@ucsc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <a
                  href="#forgot-password"
                  className="text-xs text-ucscBlue hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-ucscBlue hover:bg-ucscBlue/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a href="#sign-up" className="text-ucscBlue hover:underline">
                Sign Up
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
