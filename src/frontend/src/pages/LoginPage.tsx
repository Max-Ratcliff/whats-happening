
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
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8 pb-4">
          <Logo className="h-16 w-auto" /> {/* Ensure Logo component is imported and working */}
          <div className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Welcome to SlugScene</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in with your UCSC credentials
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 px-8 py-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email (@ucsc.edu)
              </label>
              <Input
                id="email"
                type="email"
                placeholder="slug@ucsc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue"
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button" // Important: type="button" to prevent form submission
                  onClick={handleForgotPassword}
                  className="text-xs text-ucscBlue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isGoogleLoading || !email.endsWith('@ucsc.edu')}
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue"
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
            <Button
              type="submit"
              className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md transition-colors duration-150"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Signing In..." : "Sign In/Sign Up"}
            </Button>

            <div className="relative w-full flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button
              type="button"
              variant="outline" // Assuming your Button component supports variants
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-md transition-colors duration-150 flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Signing In..."
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.821 9.927H12.182V13.936H18.045C17.418 16.318 15.218 18 12.182 18C8.782 18 6 15.218 6 11.818C6 8.418 8.782 5.636 12.182 5.636C13.709 5.636 15.082 6.164 16.136 7.091L19.091 4.136C17.182 2.364 14.818 1.273 12.182 1.273C6.764 1.273 2.5 6.055 2.5 11.818C2.5 17.582 6.764 22.364 12.182 22.364C17.655 22.364 22 17.909 22 12C22 11.218 21.936 10.527 21.821 9.927Z"/></svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
