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
import { auth } from "@/lib/firebase"; // Assuming app is not directly needed here for auth
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User, // Type for Firebase User object
  createUserWithEmailAndPassword, // Needed for Sign Up
  fetchSignInMethodsForEmail, // To check if email exists
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

// Define steps for the email login/registration flow
type EmailStep = "enterEmail" | "signIn" | "signUp";

/**
 * Login page for the application
 * Handles user authentication with UCSC email,
 * including checking if email exists before prompting for password or registration.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For sign-up
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [emailStep, setEmailStep] = useState<EmailStep>("enterEmail"); // Manage UI flow

  // // Effect to check auth state and redirect if user is already logged in
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
  //     if (currentUser) {
  //       if (currentUser.email && currentUser.email.endsWith("@ucsc.edu")) {
  //         // User is signed in with a valid UCSC email
  //         // No toast here as it might be annoying on every load if already signed in.
  //         // Navigation will handle it.
  //         if (location.pathname === "/" || location.pathname === "/login") { // check if on login page
  //           navigate("/dashboard"); // Or your main app route
  //         }
  //       } else if (currentUser.email) {
  //         // Logged in with a non-UCSC email
  //         toast.error(
  //           "Invalid email domain. Please use @ucsc.edu. Signing out..."
  //         );
  //         signOut(auth); // Force sign out
  //         setEmailStep("enterEmail"); // Reset flow
  //         setPassword("");
  //         setConfirmPassword("");
  //       } else {
  //         // User exists but email is null (e.g. anonymous, phone). Force sign out for this app's logic.
  //         toast.error("Unsupported account type. Signing out...");
  //         signOut(auth);
  //         setEmailStep("enterEmail");
  //       }
  //     } else {
  //       // User is signed out, ensure UI is reset if they were in a specific step
  //       // This might be redundant if navigation out of dashboard triggers reset, but safe.
  //       // setEmailStep("enterEmail");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [navigate]);


  // Step 1: Handle email submission to check if user exists
  const handleContinueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@ucsc.edu")) {
      toast.error("Please use a valid @ucsc.edu email address.");
      return;
    }
    setIsLoading(true);


    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        // Email does not exist, prompt for sign up
        setEmailStep("signUp");
        toast.info("New email. Please create a password to sign up.");
      } else {
        // Email exists
        const hasPasswordMethod = methods.includes('password');
        const hasGoogleMethod = methods.includes('google.com');

        if (hasGoogleMethod) {
          // Email is linked with Google ONLY (no password method)
          toast.info("This email is registered with Google Sign-In. Please use the 'Sign in with Google' button.");
          // To set up password login, you can use 'Forgot Password' from the main screen after entering your email.
          setEmailStep("enterEmail"); // Directs them back to where Google Sign-In button is prominent
        }
        else if (hasPasswordMethod) {
          // Email has a password login method. Go to password input.
          setEmailStep("signIn");
        } else {
          // Email exists with other methods but not password or Google
          toast.warning("This email is registered with an unsupported sign-in method for this action. Please try a different sign-in option or contact support.");
          setEmailStep("enterEmail");
        }
      }
    } catch (error: unknown) {
      console.error("Error checking email:", error);
      let errorMessage = "Failed to verify email. Please try again.";
      if (error instanceof FirebaseError) {
          if (error.code === "auth/invalid-email") {
              errorMessage = "The email address is not valid.";
          }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2a: Handle actual sign-in for existing users
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user.email?.endsWith("@ucsc.edu")) {
        toast.success(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`);
        navigate("/dashboard");
      } else {
        // This case should ideally be caught by onAuthStateChanged or initial email check
        toast.error("Sign-in successful, but email is not @ucsc.edu. Signing out.");
        await signOut(auth);
        setEmailStep("enterEmail"); // Reset flow
      }
    } catch (error: unknown) {
      console.error("Firebase login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found": // Should not happen if email check was done
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Too many login attempts. Please try again later or reset your password.";
            break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2b: Handle account creation for new users
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        toast.error("Password should be at least 6 characters long.");
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // `onAuthStateChanged` will handle navigation for successful signup
      toast.success(`Account created for ${userCredential.user.email}! Welcome to SlugScene.`);
      // await createUserProfileIfNeeded(userCredential.user); // If you have this function
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Firebase sign-up error:", error);
      let errorMessage = "Sign-up failed. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email is already in use. Try signing in or resetting your password.";
            setEmailStep("signIn"); // Guide them to sign in
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please choose a stronger password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In (remains largely the same)
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account',
        hd: 'ucsc.edu' // Pre-fill or restrict to UCSC domain if possible this way
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email && user.email.endsWith("@ucsc.edu")) {
        toast.success(`Signed in with Google as ${user.displayName || user.email}!`);
        // await createUserProfileIfNeeded(user); // Optional
        navigate("/dashboard");
      } else {
        toast.error("Please use your UCSC Google account (@ucsc.edu). Non-UCSC accounts are not permitted.");
        await signOut(auth); // Sign out the user from Firebase if email is not valid
        setEmailStep("enterEmail"); // Reset flow
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
            errorMessage =
              "An account already exists with this email using a different sign-in method. Try signing in with email/password or reset your password.";
            break;
          case "auth/popup-blocked":
            errorMessage =
              "Google Sign-In popup was blocked. Please allow popups.";
            break;
          case "auth/invalid-credential":
             errorMessage = "Invalid credentials for Google Sign-In.";
             break;
          case "auth/operation-not-allowed":
             errorMessage = "Google Sign-In is not enabled. Contact support.";
             break;
          case "auth/user-disabled":
             errorMessage = "This UCSC account has been disabled.";
             break;
          case "auth/unauthorized-domain": // Should not happen if Firebase project is configured
             errorMessage = "This domain is not authorized for Google Sign-In.";
             break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.info("Please enter your @ucsc.edu email in the email field first.");
      return;
    }
    if (!email.endsWith("@ucsc.edu")) {
      toast.error("Password reset is only available for @ucsc.edu emails.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(
        "Password reset email sent! Check your @ucsc.edu inbox (and spam folder)."
      );
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
            case "auth/missing-email": // Should be caught by UI
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

  const handleBack = () => {
    setEmailStep("enterEmail");
    setPassword("");
    setConfirmPassword("");
    // Keep email field populated for convenience, or clear it:
    // setEmail("");
  }

  const renderEmailForm = () => {
    if (emailStep === "signIn") {
      return (
        <form onSubmit={handleEmailSignIn}>
          <CardContent className="space-y-6 px-8 py-6">
            <div className="space-y-2">
              <label htmlFor="email-display" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email-display"
                type="email"
                value={email}
                readOnly
                className="w-full rounded-md border-gray-300 bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-ucscBlue hover:underline disabled:opacity-50"
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
          <CardFooter className="flex flex-col space-y-3 px-8 pb-8 pt-4">
             <Button
              type="submit"
              className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleBack}
              className="text-ucscBlue hover:underline text-sm"
              disabled={isLoading || isGoogleLoading}
            >
              Use a different email
            </Button>
          </CardFooter>
        </form>
      );
    }

    if (emailStep === "signUp") {
      return (
        <form onSubmit={handleEmailSignUp}>
          <CardContent className="space-y-6 px-8 py-6">
             <div className="space-y-2">
              <label htmlFor="email-display-signup" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email-display-signup"
                type="email"
                value={email}
                readOnly
                className="w-full rounded-md border-gray-300 bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-gray-700"
              >
                Create Password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue"
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue"
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 px-8 pb-8 pt-4">
            <Button
              type="submit"
              className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
             <Button
              type="button"
              variant="link"
              onClick={handleBack}
              className="text-ucscBlue hover:underline text-sm"
              disabled={isLoading || isGoogleLoading}
            >
              Use a different email
            </Button>
          </CardFooter>
        </form>
      );
    }

    // Default: emailStep === "enterEmail"
    return (
      <form onSubmit={handleContinueWithEmail}>
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
           {/* Password field removed from initial step */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
          <Button
            type="submit"
            className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md"
            disabled={isLoading || isGoogleLoading || !email}
          >
            {isLoading ? "Verifying..." : "Continue with Email"}
          </Button>
            <div className="flex justify-center items-center mt-2"> {/* Forgot Password Link for initial step */}
                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-ucscBlue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    // Enable if email has been typed and is a ucsc email, or just if email field is not empty
                    disabled={isLoading || isGoogleLoading || !email.endsWith('@ucsc.edu')}
                >
                    Forgot Password?
                </button>
            </div>
        </CardFooter>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ucscBlue to-blue-900 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8 pb-4">
          <Logo className="h-16 w-auto" />
          <div className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">
              {emailStep === "signUp"
                ? "Create SlugScene Account"
                : emailStep === "signIn"
                ? "Sign In to SlugScene"
                : "Welcome to SlugScene"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {emailStep === "signUp"
                ? `Enter a password for ${email}`
                : emailStep === "signIn"
                ? `Enter your password for ${email}`
                : "Sign in or create an account with your UCSC credentials"}
            </CardDescription>
          </div>
        </CardHeader>

        {renderEmailForm()}

        {/* Google Sign-In Button and "OR" separator - shown for all email steps unless explicitly hidden */}
        {emailStep === "enterEmail" && ( // Only show "OR" and Google on initial step, or always if preferred
            <>
                <div className="relative w-full flex items-center py-2 px-8">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">
                    Or
                    </span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="px-8 pb-8 pt-0"> {/* Adjusted padding */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-md flex items-center justify-center"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                        "Signing In..."
                        ) : (
                        <>
                            <svg
                            className="mr-2 h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path d="M21.821 9.927H12.182V13.936H18.045C17.418 16.318 15.218 18 12.182 18C8.782 18 6 15.218 6 11.818C6 8.418 8.782 5.636 12.182 5.636C13.709 5.636 15.082 6.164 16.136 7.091L19.091 4.136C17.182 2.364 14.818 1.273 12.182 1.273C6.764 1.273 2.5 6.055 2.5 11.818C2.5 17.582 6.764 22.364 12.182 22.364C17.655 22.364 22 17.909 22 12C22 11.218 21.936 10.527 21.821 9.927Z" />
                            </svg>
                            Sign in with Google
                        </>
                        )}
                    </Button>
                </div>
            </>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;