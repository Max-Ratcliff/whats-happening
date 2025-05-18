import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase'; // Your Firebase auth instance
import { User as FirebaseUser } from 'firebase/auth';
import { Club } from '@/types';      // Your centralized Club interface

import PageLayout from '@/components/layout/PageLayout'; // Assuming this is your layout
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Users, LogOut, ExternalLink, PlusCircle } from 'lucide-react'; // Icons

// API base URL (consider moving to a config file or .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const MyClubsPage: React.FC = () => {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMyClubs = useCallback(async (user: FirebaseUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/users/me/joined-clubs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorDetail = `Failed to fetch your clubs: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorDetail);
      }

      const data: Club[] = await response.json();
      setMyClubs(data);
    } catch (err) {
      console.error("Error fetching my clubs:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Could not load your clubs.", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchMyClubs(user);
      } else {
        setCurrentUser(null);
        setMyClubs([]);
        setIsLoading(false);
        toast.info("Please log in to view your clubs.");
        navigate('/login'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [fetchMyClubs, navigate]);

  const handleLeaveClub = async (clubIdToLeave: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to leave a club.");
      return;
    }

    // Simple confirmation, you can use a nicer modal dialog
    if (!window.confirm("Are you sure you want to leave this club?")) {
      return;
    }

    // Consider a more specific loading state for this action if needed
    // For now, we can use the general setIsLoading or a new one.
    // Let's assume a general indication is fine.
    const originalClubs = [...myClubs];
    setMyClubs(prevClubs => prevClubs.filter(club => club.clubId !== clubIdToLeave)); // Optimistic update

    try {
      const token = await currentUser.getIdToken();
      // Endpoint based on your plan: POST /clubs/{club_id}/leave
      const response = await fetch(`${API_BASE_URL}/clubs/${clubIdToLeave}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorDetail = `Failed to leave club: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorDetail);
      }

      const result = await response.json(); // Assuming backend sends a success message
      toast.success(result.message || "Successfully left the club.");
      // No need to re-fetch if optimistic update was successful.
      // If not optimistic, or to ensure consistency: fetchMyClubs(currentUser);
    } catch (err) {
      console.error("Error leaving club:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Failed to leave club.", { description: errorMessage });
      setMyClubs(originalClubs); // Revert optimistic update on error
    }
  };


  if (isLoading && myClubs.length === 0) { // Show full page loader only on initial load
    return (
      <PageLayout>
        <div className="app-container py-6 flex justify-center items-center min-h-[calc(100vh-150px)]">
          <Loader2 className="h-10 w-10 animate-spin text-ucscBlue" />
          <span className="ml-3 text-lg">Loading Your Clubs...</span>
        </div>
      </PageLayout>
    );
  }

  if (error && myClubs.length === 0) { // Show full page error only if initial load failed
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-red-500 text-xl mb-4">Could not load your clubs.</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => currentUser && fetchMyClubs(currentUser)}>Try Again</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="app-container py-6 px-4 md:px-0">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-ucscBlue mb-3">My Clubs</h1>
          <p className="text-md sm:text-lg text-ucscGold">
            Clubs you've joined and are a part of.
          </p>
        </header>

        {myClubs.length === 0 && !isLoading && (
          <Card className="text-center p-8 max-w-lg mx-auto border-dashed border-ucscBlue/50">
            <CardHeader className="items-center"> {/* Center icon */}
                <Users className="h-16 w-16 text-ucscBlue/70 mb-4" />
                <CardTitle className="text-2xl text-ucscBlue">You Haven't Joined Any Clubs Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground mb-6">
                Head over to the explore page to discover and join clubs that match your interests!
              </CardDescription>
              <Button asChild size="lg" className="bg-ucscGold hover:bg-ucscGold/90 text-ucscBlue font-semibold">
                <Link to="/explore">
                  <PlusCircle className="mr-2 h-5 w-5" /> Explore Clubs
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {myClubs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map((club) => (
              <Card key={club.clubId} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center p-2 overflow-hidden">
                  {club.logoURL ? (
                    <img
                      src={club.logoURL}
                      alt={`${club.name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Users className="w-20 h-20 text-ucscBlue text-opacity-30" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-ucscBlue truncate" title={club.name}>
                    {club.name}
                  </CardTitle>
                  {/* Display first category as a badge */}
                  {club.category && club.category.length > 0 && (
                    <span className="inline-block bg-ucscBlue/10 text-ucscBlue text-xs font-medium mt-1 px-2 py-0.5 rounded-full">
                      {club.category[0]}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="flex-grow text-sm py-2">
                  <p className="text-gray-700 line-clamp-4">{club.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 p-3 bg-gray-50 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full sm:w-auto border-ucscBlue text-ucscBlue hover:bg-ucscBlue/10"
                  >
                    <Link to={`/clubs/${club.clubId}`}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Club
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleLeaveClub(club.clubId)}
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" /> Leave Club
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {/* Display general error if it occurred but some clubs might still be shown (e.g. from stale state before error) */}
        {error && myClubs.length > 0 && (
             <div className="text-center py-6">
                <p className="text-red-500">Error updating clubs: {error}</p>
            </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyClubsPage;
