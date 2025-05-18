
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

//const auth = getAuth();
//const user = auth.currentUser; // <-- UID created by Firebase Auth
//const uid = user?.uid;

  const SignUp = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            }else{
                navigate("/login");
            }
        });
        return() => unsubscribe();
      }, []);
    //const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
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

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try{
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            name: formData.name,
            notificationPreferences: formData.notificationPreferences.newPostEmail,
            joinedClubs: [],
            likeContent: [],
            eventsAttend: [],
        });
    toast.success("Account created!");
    navigate("/dashboard");
    // Here we would normally implement firebase auth registration
    // For the purpose of this demo, just show a toast indicating success
    } catch (err) {
    console.error("Error saving profile:", err);
    toast.error("Failed to create user profile. Please try again.");
  }
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
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                </button>

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
                Receive notifications for new posts
              </label>
            </div>
            <Button type="submit" className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md">
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;