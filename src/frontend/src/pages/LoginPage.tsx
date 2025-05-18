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
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo, // Import this
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust path if needed

type EmailStep = "enterEmail" | "signIn" | "signUp";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [emailStep, setEmailStep] = useState<EmailStep>("enterEmail");

  // Effect to check auth state and redirect if user is already logged in
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
  //     if (currentUser) {
  //       if (currentUser.email && currentUser.email.endsWith("@ucsc.edu")) {
  //         // User is signed in with a valid UCSC email.
  //         // If they are on the login page and already signed in, redirect to dashboard.
  //         // This handles cases where the user navigates back to login or opens login in a new tab.
  //         if (location.pathname === "/" || location.pathname === "/login") {
  //           // Check if a navigation to /signuppage is pending (e.g., from a recent signup)
  //           // For simplicity here, we'll directly navigate to dashboard.
  //           // A more robust solution for "profile setup" would involve checking a user profile flag.
  //           // But if direct navigation to /signuppage from handlers is immediate, this should be okay.
  //           navigate("/dashboard");
  //         }
  //       } else if (currentUser.email) {
  //         toast.error(
  //           "Invalid email domain. Please use @ucsc.edu. Signing out..."
  //         );
  //         signOut(auth);
  //         setEmailStep("enterEmail");
  //         setPassword("");
  //         setConfirmPassword("");
  //       } else {
  //         toast.error("Unsupported account type. Signing out...");
  //         signOut(auth);
  //         setEmailStep("enterEmail");
  //       }
  //     } else {
  //       // User is signed out
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [navigate]);


  const handleContinueWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@ucsc.edu")) {
      toast.error("Please use a valid @ucsc.edu email address.");
      return;
    }
    setIsLoading(true);
    console.log(`[Auth] Checking email: '${email}'`);

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log(`[Auth] Sign-in methods for ${email}:`, methods);

      if (methods.length === 0) {
        setEmailStep("signUp");
        toast.info("This email isn't registered yet. Please create a password to sign up.");
      } else {
        const hasPasswordMethod = methods.includes('password');
        const hasGoogleMethod = methods.includes('google.com');

        if (hasPasswordMethod) {
          setEmailStep("signIn");
          if (hasGoogleMethod) {
            toast.info("This email is recognized. Enter your password, or you can use the Google Sign-In option.");
          } else {
            toast.info("This email is recognized. Please enter your password.");
          }
        } else if (hasGoogleMethod) {
          toast.info("This email is registered with Google Sign-In. Please use the 'Sign in with Google' button.");
          setEmailStep("enterEmail");
        } else {
          toast.warning("This email is registered with an unsupported sign-in method. Please try a different option or contact support.");
          setEmailStep("enterEmail");
        }
      }
    } catch (error: unknown) {
      console.error("[Auth] Error checking email:", error);
      let errorMessage = "Failed to verify email. Please try again.";
       if (error instanceof FirebaseError && error.code === "auth/invalid-email") {
           errorMessage = "The email address is not valid.";
       }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth,email,password);
      if (userCredential.user.email?.endsWith("@ucsc.edu")) {
        const uid = userCredential.user.uid;
        console.log(`Signed in with email. UID: ${uid}, Email: ${userCredential.user.email}`);
        toast.success(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`);
        navigate("/dashboard");
      } else {
        toast.error("Sign-in successful, but email is not @ucsc.edu. Signing out.");
        await signOut(auth);
        setEmailStep("enterEmail");
      }
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
      const userEmail = user.email;

      console.log(`New account created via Email. UID: ${uid}, Email: ${userEmail}`);
      toast.success(`Account created for ${userEmail}! Please complete your profile.`);
      
      // TODO: Call function to create user profile in Firestore with UID, email, etc.
      // e.g., await createUserProfileInFirestore(uid, { email: userEmail, displayName: userEmail?.split('@')[0] });

      navigate("/signuppage"); // Navigate to profile setup page
    } catch (error: unknown) {
      console.error("Firebase sign-up error:", error);
      let errorMessage = "Sign-up failed. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use. Try signing in or resetting your password.";
            // Optionally, re-check methods to guide better
             try {
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods.includes('password')) setEmailStep("signIn");
                else if (methods.includes('google.com')) setEmailStep("enterEmail");
                else setEmailStep("enterEmail"); // Default fallback
            } catch (fetchError) {
                setEmailStep("signIn"); // Fallback
            }
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak.";
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account',
        hd: 'ucsc.edu'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result); // Get additional info

      if (user.email && user.email.endsWith("@ucsc.edu")) {
        const uid = user.uid;
        const userEmail = user.email;
        const displayName = user.displayName;

        if (additionalUserInfo?.isNewUser) {
          console.log(`New account created via Google. UID: ${uid}, Email: ${userEmail}, DisplayName: ${displayName}`);
          toast.success(`Account created for ${displayName || userEmail}! Please complete your profile.`);
          // TODO: Call function to create user profile in Firestore with UID, email, displayName, etc.
          // e.g., await createUserProfileInFirestore(uid, { email: userEmail, displayName: displayName });
          navigate("/signuppage"); // Navigate to profile setup page for new Google users
        } else {
          console.log(`Existing user signed in via Google. UID: ${uid}, Email: ${userEmail}, DisplayName: ${displayName}`);
          toast.success(`Welcome back, ${displayName || userEmail}!`);
          navigate("/dashboard"); // Navigate to dashboard for existing Google users
        }
      } else {
        toast.error("Please use your UCSC Google account (@ucsc.edu). Non-UCSC accounts are not permitted.");
        await signOut(auth);
        setEmailStep("enterEmail");
      }
    } catch (error: unknown) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "Google Sign-In failed.";
      if (error instanceof FirebaseError) {
        // ... (your existing FirebaseError handling for Google Sign-In)
        switch (error.code) {
            case "auth/popup-closed-by-user": errorMessage = "Google Sign-In cancelled."; break;
            case "auth/account-exists-with-different-credential": errorMessage = "An account already exists with this email using a different sign-in method."; break;
            case "auth/popup-blocked": errorMessage = "Google Sign-In popup was blocked. Please allow popups."; break;
            // Add other cases as needed
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // ... (your existing forgot password logic)
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
      toast.success("Password reset email sent! Check your @ucsc.edu inbox.");
    } catch (error: unknown) {
        console.error("Forgot password error:", error);
        let errorMessage = "Failed to send password reset email.";
        if (error instanceof FirebaseError) {
            switch (error.code) {
            case "auth/user-not-found": errorMessage = "No user found with this UCSC email address."; break;
            // ... other cases
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
  };

  const renderEmailForm = () => {
    // ... (your existing renderEmailForm logic remains the same)
    // Ensure the submit buttons in this form correctly call:
    // - handleEmailSignIn for the "signIn" step
    // - handleEmailSignUp for the "signUp" step
    // - handleContinueWithEmail for the "enterEmail" step
    // Your provided code for renderEmailForm seems to do this.
    if (emailStep === "signIn") {
      return (
        <form onSubmit={handleEmailSignIn}>
          {/* ... SignIn form content ... */}
          <CardContent className="space-y-6 px-8 py-6">
            <div className="space-y-2">
              <label htmlFor="email-display" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email-display" type="email" value={email} readOnly className="w-full rounded-md border-gray-300 bg-gray-100"/>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-ucscBlue hover:underline disabled:opacity-50" disabled={isLoading || isGoogleLoading || !email.endsWith('@ucsc.edu')}>Forgot Password?</button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue" disabled={isLoading || isGoogleLoading}/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 px-8 pb-8 pt-4">
             <Button type="submit" className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md" disabled={isLoading || isGoogleLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Button type="button" variant="link" onClick={handleBack} className="text-ucscBlue hover:underline text-sm" disabled={isLoading || isGoogleLoading}>
              Use a different email
            </Button>
          </CardFooter>
        </form>
      );
    }

    if (emailStep === "signUp") {
      return (
        <form onSubmit={handleEmailSignUp}>
          {/* ... SignUp form content ... */}
           <CardContent className="space-y-6 px-8 py-6">
             <div className="space-y-2">
              <label htmlFor="email-display-signup" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email-display-signup" type="email" value={email} readOnly className="w-full rounded-md border-gray-300 bg-gray-100"/>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700">Create Password</label>
              <Input id="new-password" type="password" placeholder="•••••••• (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue" disabled={isLoading || isGoogleLoading}/>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue" disabled={isLoading || isGoogleLoading}/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 px-8 pb-8 pt-4">
            <Button type="submit" className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md" disabled={isLoading || isGoogleLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
             <Button type="button" variant="link" onClick={handleBack} className="text-ucscBlue hover:underline text-sm" disabled={isLoading || isGoogleLoading}>
              Use a different email
            </Button>
          </CardFooter>
        </form>
      );
    }

    return ( // Default: emailStep === "enterEmail"
      <form onSubmit={handleContinueWithEmail}>
        {/* ... EnterEmail form content ... */}
        <CardContent className="space-y-6 px-8 py-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email (@ucsc.edu)</label>
            <Input id="email" type="email" placeholder="slug@ucsc.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border-gray-300 focus:border-ucscBlue focus:ring-ucscBlue" disabled={isLoading || isGoogleLoading}/>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
          <Button type="submit" className="w-full bg-ucscBlue hover:bg-ucscBlue/90 text-white font-semibold py-2.5 rounded-md" disabled={isLoading || isGoogleLoading || !email || !email.includes('@')}>
            {isLoading ? "Verifying..." : "Continue with Email"}
          </Button>
            <div className="flex justify-center items-center mt-2">
                <button type="button" onClick={handleForgotPassword} className="text-xs text-ucscBlue hover:underline disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || isGoogleLoading || !email.endsWith('@ucsc.edu')}>
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
        {/* ... CardHeader and other static JSX ... */}
        <CardHeader className="space-y-4 flex flex-col items-center pt-8 pb-4">
          <Logo className="h-16 w-auto" />
          <div className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">
              {emailStep === "signUp" ? "Create SlugScene Account"
                : emailStep === "signIn" ? "Sign In to SlugScene"
                : "Welcome to SlugScene"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {emailStep === "signUp" ? `Enter a password for ${email}`
                : emailStep === "signIn" ? `Enter your password for ${email}`
                : "Sign in or create an account with your UCSC credentials"}
            </CardDescription>
          </div>
        </CardHeader>

        {renderEmailForm()}

        {emailStep === "enterEmail" && (
            <>
                <div className="relative w-full flex items-center py-2 px-8">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="px-8 pb-8 pt-0">
                    <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-md flex items-center justify-center" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                        {isGoogleLoading ? "Signing In..." : (<><svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.821 9.927H12.182V13.936H18.045C17.418 16.318 15.218 18 12.182 18C8.782 18 6 15.218 6 11.818C6 8.418 8.782 5.636 12.182 5.636C13.709 5.636 15.082 6.164 16.136 7.091L19.091 4.136C17.182 2.364 14.818 1.273 12.182 1.273C6.764 1.273 2.5 6.055 2.5 11.818C2.5 17.582 6.764 22.364 12.182 22.364C17.655 22.364 22 17.909 22 12C22 11.218 21.936 10.527 21.821 9.927Z" /></svg>Sign in with Google</>)}
                    </Button>
                </div>
            </>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
