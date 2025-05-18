import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase'; // Your Firebase auth instance
import { User as FirebaseUser } from 'firebase/auth';
import { Club } from '@/types';     // Your centralized Club interface

import PageLayout from '@/components/layout/PageLayout'; // Assuming this is your layout
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader, // Will be removed for the new style
    CardTitle, // Will be used as <h3> inside CardContent
    CardDescription, // Can be used if needed, but ExplorePage uses <p>
    CardFooter
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Users, LogOut, ExternalLink, PlusCircle } from 'lucide-react'; // Icons

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const MyClubsPage: React.FC = () => {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For overall page load
  const [error, setError] = useState<string | null>(null);
  const [leavingClubId, setLeavingClubId] = useState<string | null>(null); // For "Leave Club" button loading state
  const navigate = useNavigate();

  const fetchMyClubs = useCallback(async (user: FirebaseUser) => {
    // ... (fetchMyClubs function remains the same)
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
    // ... (useEffect for auth state remains the same) ...
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchMyClubs(user);
      } else {
        setCurrentUser(null);
        setMyClubs([]);
        setIsLoading(false);
        toast.info("Please log in to view your clubs.");
        navigate('/login'); 
      }
    });
    return () => unsubscribe();
  }, [fetchMyClubs, navigate]);

  const handleLeaveClub = async (clubIdToLeave: string, clubName: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to leave a club.");
      return;
    }

    if (!window.confirm(`Are you sure you want to leave ${clubName}?`)) {
      return;
    }

    setLeavingClubId(clubIdToLeave); // Set loading state for this button
    const originalClubs = [...myClubs];
    
    // Optimistic update
    setMyClubs(prevClubs => prevClubs.filter(club => club.clubId !== clubIdToLeave));

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/clubs/${clubIdToLeave}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorDetail = `Failed to leave club: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) { /* Ignore */ }
        throw new Error(errorDetail);
      }

      const result = await response.json();
      toast.success(result.message || `Successfully left ${clubName}.`);
      // No need to re-fetch if optimistic update is desired to be permanent on this view
      // OR: if you want to ensure data consistency after leaving, call fetchMyClubs(currentUser) again
      // but that would negate the optimistic update's immediate effect if the list re-renders fully.
      // For now, optimistic update is kept.
    } catch (err) {
      console.error("Error leaving club:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Failed to leave club.", { description: errorMessage });
      setMyClubs(originalClubs); // Revert optimistic update on error
    } finally {
      setLeavingClubId(null); // Reset loading state
    }
  };

  // ... (isLoading and error JSX for overall page remains the same) ...
  if (isLoading && myClubs.length === 0) { /* ... */ }
  if (error && myClubs.length === 0) { /* ... */ }

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
          // ... ("You Haven't Joined Any Clubs Yet" Card JSX remains the same) ...
           <Card className="text-center p-8 max-w-lg mx-auto border-dashed border-ucscBlue/50">
            <CardHeader className="items-center">
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
              // Apply ExplorePage card styling here
              <Card 
                key={club.clubId} 
                className="slugscene-card overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 flex flex-col"
              >
                <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                  {club.logoURL ? (
                    <img
                      src={club.logoURL}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-contain p-4" // Style from ExplorePage
                    />
                  ) : (
                    <Users className="w-20 h-20 text-ucscBlue text-opacity-30" />
                  )}
                </div>
                <CardContent className="p-4 flex flex-col flex-grow"> {/* Style from ExplorePage */}
                  <h3 className="font-bold text-lg text-ucscBlue mb-1 truncate" title={club.name}>
                    {club.name}
                  </h3>
                  {club.category && club.category.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1"> {/* Style from ExplorePage */}
                      {club.category.slice(0, 2).map((cat, index) => ( // Show max 2 categories
                        <span 
                          key={index} 
                          className="text-xs bg-ucscGold/20 text-ucscGold-dark rounded-full px-2 py-0.5" // Style from ExplorePage
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow"> {/* Style from ExplorePage */}
                    {club.description}
                  </p>
                  {/* Footer actions - keep specific MyClubsPage buttons */}
                  <div className="mt-auto flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t border-gray-200">
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
                      onClick={() => handleLeaveClub(club.clubId, club.name)} // Pass clubName for toast message
                      disabled={leavingClubId === club.clubId}
                      className="w-full sm:w-auto"
                    >
                      {leavingClubId === club.clubId ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Leave Club
                    </Button>
                  </div>
                </CardContent>
                {/* CardFooter is not used in ExplorePage style, actions are part of CardContent */}
              </Card>
            ))}
          </div>
        )}
        {/* General error display (if some clubs loaded but then an error occurred, e.g. during leave) */}
        {error && myClubs.length > 0 && (
            <div className="text-center py-6">
                <p className="text-red-500">Error: {error}</p>
            </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyClubsPage;
