
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useToast } from "@/components/ui/use-toast";

const SignUp = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    displayName: "",
    notificationPreferences: {
      newPostEmail: true,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      notificationPreferences: {
        ...formData.notificationPreferences,
        newPostEmail: checked,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would normally implement firebase auth registration
    // For the purpose of this demo, just show a toast indicating success
    toast({
      title: "Account created!",
      description: "Your account has been successfully created.",
    });
    
    console.log("Form submission data:", {
      ...formData,
      userId: "firebase-generated-uid-would-go-here",
      joinedClubs: [], // Empty array for new users
      isOfficerOf: [], // Empty array for new users
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-slugscene flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to SlugScene</CardTitle>
          <CardDescription>
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (e.g., slug@ucsc.edu)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="slug@ucsc.edu"
                required
                value={formData.email}
                onChange={handleInputChange}
                pattern=".+@ucsc\.edu$"
                title="Please use your UCSC email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (Optional)</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="How you want to be known"
                value={formData.displayName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <div className="flex relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="notificationPreferences"
                checked={formData.notificationPreferences.newPostEmail}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="notificationPreferences"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Receive email notifications for new posts
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-slugscene hover:bg-slugscene-light">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-slugscene hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;