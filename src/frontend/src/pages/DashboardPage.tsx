import React, { useState, useEffect } from "react";
import { format } from "date-fns"; // Import date-fns for formatting
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Heart, Loader2, Users as UsersIcon } from "lucide-react"; // Renamed Users to UsersIcon
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp, // Firestore Timestamp for type and conversion
  DocumentData,
  where,     // For filtering upcoming events
  limit      // For limiting the number of events
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your Firebase db instance

// Interface for Club Posts (already in your file)
interface ClubPost {
  id: string;
  clubId: string;
  clubName: string;
  clubAvatar?: string;
  caption: string;
  imageURL?: string;
  timestamp: Timestamp;
  likesCount: number;
  commentsCount: number;
}

// Interface for Fetched Events (can be shared with CalendarPage or defined here)
interface FetchedEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  location: string;
  clubId: string;
  clubName: string;
  clubLogo?: string;
}

const DashboardPage: React.FC = () => {
  // State for Club Posts (from your existing code)
  const [fetchedClubPosts, setFetchedClubPosts] = useState<ClubPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true); // Renamed for clarity
  const [postsError, setPostsError] = useState<string | null>(null); // Renamed for clarity

  // State for Upcoming Events
  const [fetchedUpcomingEvents, setFetchedUpcomingEvents] = useState<FetchedEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Fetch Club Posts (your existing useEffect)
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError(null);
      try {
        const postsRef = collection(db, "clubPosts");
        const q = query(postsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const postsData: ClubPost[] = snapshot.docs.map((doc): ClubPost => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            clubId: data.clubId || "",
            clubName: data.clubName || "Unknown Club",
            clubAvatar: data.clubAvatar,
            caption: data.caption || "No content available.",
            imageURL: data.imageURL,
            timestamp: data.timestamp as Timestamp,
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
          };
        });
        setFetchedClubPosts(postsData);
      } catch (err) {
        console.error("Error fetching club posts:", err);
        setPostsError(err instanceof Error ? err.message : "Failed to fetch posts.");
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  // Fetch Upcoming Events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setIsLoadingEvents(true);
      setEventsError(null);
      try {
        const eventsRef = collection(db, "events"); // Use "events" collection
        const now = new Date(); // Get current date and time
        const q = query(
          eventsRef,
          where("startTime", ">=", now), // Filter for events starting from now onwards
          orderBy("startTime", "asc"),   // Order by start time (soonest first)
          limit(4)                       // Limit to, for example, 4 upcoming events
        );
        const snapshot = await getDocs(q);
        const eventsData: FetchedEvent[] = snapshot.docs.map((doc): FetchedEvent => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            title: data.title || "Untitled Event",
            description: data.description,
            startTime: data.startTime as Timestamp, // Expecting Firestore Timestamp
            endTime: data.endTime as Timestamp,   // Optional
            location: data.location || "TBD",
            clubId: data.clubId || "",
            clubName: data.clubName || "Unknown Club",
            clubLogo: data.clubLogo,
          };
        });
        setFetchedUpcomingEvents(eventsData);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
        setEventsError(err instanceof Error ? err.message : "Failed to fetch upcoming events.");
        // Optionally use toast here: toast.error("Could not load upcoming events.");
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const formatPostTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return "A while ago";
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " at " + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Combined loading state for the main content area (posts)
  if (isLoadingPosts) {
    return (
      <PageLayout>
        <div className="app-container py-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-ucscBlue" />
          <p className="ml-4 text-xl">Loading Latest Updates...</p>
        </div>
      </PageLayout>
    );
  }

  // Error state for posts (main content)
   if (postsError) {
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-red-500 text-xl mb-3">Could not load posts.</p>
          <p className="text-gray-600 mb-4">{postsError}</p>
          <Button onClick={() => { /* Implement refetchPosts logic */ }}>Try Again</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="app-container py-6 px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feed Column (Club Posts) */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-ucscBlue mb-4">Latest Updates</h1>
            {fetchedClubPosts.length === 0 && !isLoadingPosts ? (
              <Card className="slugscene-card shadow">
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>No club updates yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              fetchedClubPosts.map((post) => (
                <Card key={post.id} className="slugscene-card shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                      {post.clubAvatar ? (
                        <img
                          src={post.clubAvatar}
                          alt={post.clubName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-semibold">
                          {post.clubName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-ucscBlue">{post.clubName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatPostTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-800">{post.caption}</p>
                      {post.imageURL && (
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src={post.imageURL}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-6 pt-2 text-sm">
                        <button className="flex items-center text-gray-600 hover:text-ucscBlue transition-colors">
                          <Heart className="h-4 w-4 mr-1.5" />
                          <span>{post.likesCount} Likes</span>
                        </button>
                        <button className="text-gray-600 hover:text-ucscBlue transition-colors">
                          {post.commentsCount} Comments
                        </button>
                        <div className="ml-auto">
                          <Button variant="outline" size="sm" onClick={() => alert(`Maps to club ${post.clubId}`)}>
                            View Club
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-20"> {/* Adjust top-X based on your header height */}
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center text-ucscBlue">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Events
                  </h2>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto"> {/* Scrollable event list */}
                    {isLoadingEvents ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-ucscBlue inline-block" />
                      </div>
                    ) : eventsError ? (
                      <p className="px-6 py-4 text-sm text-red-500">{eventsError}</p>
                    ) : fetchedUpcomingEvents.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-500">No upcoming events.</p>
                    ) : (
                      fetchedUpcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="px-5 py-3 hover:bg-slate-50 transition-colors"
                          // Optional: onClick={() => navigateToEventDetails(event.id)}
                        >
                          <h4 className="font-semibold text-ucscBlue text-md">{event.title}</h4>
                          <p className="text-xs text-gray-500">
                            {event.clubName}
                          </p>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {event.startTime ? format(event.startTime.toDate(), "MMM d, p") : "Date TBD"}
                          </p>
                          <p className="text-xs text-gray-500">{event.location}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6 shadow-lg">
                <CardHeader>
                     <h3 className="text-xl font-semibold text-ucscBlue">Popular Categories</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Academic", "Arts", "Sports", "Tech", "Social", "Cultural", "Professional"
                    ].map((category) => (
                      <Button 
                        key={category} 
                        variant="outline" 
                        size="sm"
                        className="text-sm border-ucscBlue text-ucscBlue hover:bg-ucscGold/10"
                        // onClick={() => navigateToExploreWithCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
