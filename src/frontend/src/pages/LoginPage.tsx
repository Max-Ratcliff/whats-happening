
import React, { useState, useEffect } from "react";
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
import { auth, app } from "@/lib/firebase"; // Import Firebase auth for authentication
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User, // Type for Firebase User object
  // createUserWithEmailAndPassword, // Needed for a separate Sign Up page
} from "firebase/auth";
import { FirebaseError } from "firebase/app";


/**
 * Login page for the application
 * Handles user authentication with UCSC email
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);


  // Effect to check auth state and redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      if (currentUser) {
        // User is signed in
        if (currentUser.email && currentUser.email.endsWith("@ucsc.edu")) {
          // If email is valid UCSC, navigate to dashboard
          toast.info(`Already signed in as ${currentUser.displayName || currentUser.email}`);
          navigate("/dashboard"); // Or your main app route
        } else if (currentUser.email) {
          // If logged in with a non-UCSC email (e.g., from a previous session or error)
          toast.error("Invalid email domain. Please use @ucsc.edu. Signing out...");
          signOut(auth); // Force sign out
        }
        // If currentUser.email is null (e.g. anonymous user, though not explicitly handled here)
        // you might want to handle that case or sign them out too.
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);


  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // …email checks…

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // …success path…
    } catch (error: unknown) {
        console.error("Firebase login error:", error);
        let errorMessage = "Login failed. Please check your credentials.";

        if (error instanceof FirebaseError) {
            switch (error.code) {
                case "auth/user-not-found":
                case "auth/wrong-password":
                case "auth/invalid-credential":
                    errorMessage = "Invalid email or password.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Please enter a valid email address.";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many login attempts. Please try again later or reset your password.";
                    break;
            }
        }
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    // Optional: You can prompt the user to select an account.
    // provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email && user.email.endsWith("@ucsc.edu")) {
        toast.success(`Signed in as ${user.displayName || user.email}!`);
        // await createUserProfileIfNeeded(user); // Optional: Create/update profile in Firestore
        navigate("/dashboard");
      } else {
        toast.error("Please use your UCSC Google account (@ucsc.edu).");
        await signOut(auth); // Sign out the user from Firebase if email is not valid
      }
    } catch (error: unknown) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "Google Sign-In failed.";
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Google Sign-In cancelled.";
            break;
          case "auth/account-exists-with-different-credential":
            errorMessage = "An account already exists with this email using a different sign-in method.";
            break;
          case "auth/popup-blocked":
            errorMessage = "Google Sign-In popup was blocked by the browser. Please allow popups for this site.";
            break;
          case "auth/invalid-credential":
            errorMessage = "Invalid credentials. Please try again.";
            break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle "Forgot Password"
  const handleForgotPassword = async () => {
    if (!email) {
      toast.info("Please enter your email address in the email field to reset your password.");
      return;
    }
    if (!email.endsWith("@ucsc.edu")) {
      toast.error("Password reset is only available for @ucsc.edu emails.");
      return;
    }

    setIsLoading(true); // Reuse isLoading or create a specific one
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your @ucsc.edu inbox (and spam folder).");
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      let errorMessage = "Failed to send password reset email.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No user found with this UCSC email address.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/missing-email":
            errorMessage = "Please enter your email address.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please try again later.";
            break;
        }
      }
      toast.error(errorMessage);
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
