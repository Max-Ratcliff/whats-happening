import React, { useState, useEffect } from "react"; // Added useState, useEffect
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Heart, Loader2 } from "lucide-react"; // Added Loader2
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp, // For type annotation and conversion
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your Firebase db instance

// Define the structure of a club post fetched from Firestore
interface ClubPost {
  id: string; // Firestore document ID
  clubId: string; // Matches your updated Firestore field
  clubName: string;
  clubAvatar?: string;
  caption: string;
  imageURL?: string; // Adjusted to imageURL (all caps)
  timestamp: Timestamp; // Expecting a Firestore Timestamp object
  likesCount: number;
  commentsCount: number;
}

/**
 * Dashboard/Home page component
 * Shows a feed of club updates and upcoming events
 */
const DashboardPage: React.FC = () => {
  const [fetchedClubPosts, setFetchedClubPosts] = useState<ClubPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for upcoming events - this can remain or be fetched similarly
  const upcomingEvents = [
    {
      id: 1,
      title: "Robotics Workshop",
      date: "May 20, 2025", // Note: These are static dates for the example
      time: "3:00 PM",
      location: "Engineering 2, Room 180",
      club: "Robotics Club",
    },
    {
      id: 2,
      title: "Photography Hike",
      date: "May 21, 2025",
      time: "10:00 AM",
      location: "UCSC Arboretum",
      club: "Photography Club",
    },
    // Add more mock events if needed
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const postsRef = collection(db, "clubPosts");
        // Query to order posts by timestamp in descending order (newest first)
        const q = query(postsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const postsData: ClubPost[] = snapshot.docs.map((doc): ClubPost => {
          const data = doc.data() as DocumentData; // Cast to DocumentData for type safety
          return {
            id: doc.id,
            clubId: data.clubId || "", // Ensure this matches your Firestore field name
            clubName: data.clubName || "Unknown Club",
            clubAvatar: data.clubAvatar,
            caption: data.caption || "No content available.",
            imageURL: data.imageURL, // Adjusted to use imageURL from Firestore
            timestamp: data.timestamp as Timestamp, // Critical: data.timestamp must be a Firestore Timestamp object
            likesCount: data.likesCount || 0,
            commentsCount: data.commentsCount || 0,
          };
        });
        setFetchedClubPosts(postsData);
      } catch (err) {
        console.error("Error fetching club posts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch posts."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this effect runs once on component mount

  // Helper function to format Firestore Timestamp for display
  const formatPostTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return "A while ago"; // Fallback if timestamp is undefined
    // For a simple display:
    const date = timestamp.toDate();
    // More sophisticated relative time formatting can be added here (e.g., using date-fns library)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " at " + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };


  if (isLoading) {
    return (
      <PageLayout>
        <div className="app-container py-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-ucscBlue" />
          <p className="ml-4 text-xl">Loading Latest Updates...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-red-500 text-xl mb-3">Could not load posts.</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => { /* Implement refetch logic if desired */ }}>Try Again</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="app-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold">Latest Updates</h1>

            {fetchedClubPosts.length === 0 ? (
              <Card className="slugscene-card">
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>No club updates yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              fetchedClubPosts.map((post) => (
                <Card key={post.id} className="slugscene-card">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200"> {/* Placeholder background */}
                      {post.clubAvatar ? (
                        <img
                          src={post.clubAvatar}
                          alt={post.clubName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-semibold">
                           {post.clubName?.charAt(0).toUpperCase()} {/* Fallback to first letter of club name */}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{post.clubName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatPostTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <p>{post.caption}</p> {/* Was post.content in mock */}

                      {/* Optional Post Image - uses imageURL */}
                      {post.imageURL && (
                        <div className="rounded-md overflow-hidden border"> {/* Added border for better definition */}
                          <img
                            src={post.imageURL}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center space-x-6 pt-2">
                        <button className="flex items-center text-gray-500 hover:text-ucscBlue transition-colors">
                          <Heart className="h-5 w-5 mr-1" />
                          <span>{post.likesCount}</span> {/* Was post.likes in mock */}
                        </button>
                        <button className="text-gray-500 hover:text-ucscBlue transition-colors">
                          {post.commentsCount} Comments {/* Was post.comments in mock */}
                        </button>
                        <div className="ml-auto">
                          {/* This button would ideally link to the club's page using post.clubId */}
                          <Button variant="outline" size="sm">
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

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-6">
            <div className="sticky top-20"> {/* Adjust top-X as needed for your header height */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-ucscBlue" />
                    Upcoming Events
                  </h2>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {upcomingEvents.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-gray-500">No upcoming events listed.</p>
                    ) : (
                        upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-gray-500">
                            {event.date} • {event.time}
                            </p>
                            <p className="text-sm text-gray-500">
                            {event.club} • {event.location}
                            </p>
                        </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Academic", "Arts", "Sports", "Tech", "Social", "Cultural", "Professional", "Service"
                    ].map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        className="text-sm"
                        // onClick={() => navigateToCategory(category)} // Optional: link to explore page with category filter
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
