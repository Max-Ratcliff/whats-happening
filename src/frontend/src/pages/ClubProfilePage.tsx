
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Import auth
import { Club } from "@/types";
import { toast } from "sonner"; // For notifications

/**
 * Club Profile page component
 * Shows detailed information about a specific club
 */
const ClubProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { clubId } = useParams<{ clubId: string }>(); // add type here for safety
  console.log("clubId from URL:", clubId); // ✅ Safe location
  const [activeCategory, setActiveCategory] = useState<string | null>("All");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(true);

    useEffect(() => {
      const fetchClubs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const clubsRef = collection(db, "clubs");
          const snapshot = await getDocs(clubsRef);
          const clubData: Club[] = snapshot.docs.map((doc): Club => {
            const data = doc.data() as DocumentData;
            return {
              clubId: doc.id,
              name: data.name || "Unnamed Club",
              description: data.description || "No description available.",
              category: Array.isArray(data.category) ? data.category : [],
              contactEmail: Array.isArray(data.contactEmail) ? data.contactEmail : [],
              logoURL: data.logoURL || undefined,
              memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
              clubBanner: data.clubBanner || undefined,
              instagram: data.instagram || " ",
              clubMeetingTime: data.clubMeetingTime || "No meeting times available.",
              website: data.website || "No website available",
              location: data.location || "Location varies",
            };
          });
          console.log("Fetched clubs from Firestore:", clubData);
          setClubs(clubData);
        } catch (err) {
          console.error("Error fetching clubs from Firestore:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch clubs.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchClubs();
    }, []);

  // Mock club data - In a real app, this would be fetched based on the id

  // Handle joining/leaving a club
 /* const handleMembershipToggle = () => {
    if (isMember) {
      // Leave club logic
      toast.success(`You have left ${club.name}`);
    } else {
      // Join club logic
      toast.success(`You have joined ${club.name}!`);
    }
    setIsMember(!isMember);
  };
  */

  const club = clubs.find((c) => c.clubId === clubId);
  if (isLoading || !club) {
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-lg text-gray-600">Loading club information...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Club Cover and Basic Info */}
      <div
        className="h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${club.clubBanner})` }}
      >
        <div className="h-full w-full bg-black bg-opacity-30"></div>
      </div>

      <div className="app-container">
        {/* Club Header Section */}
        <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end">
          {/* Club Logo */}
          <div className="absolute -top-16 left-4 h-32 w-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
            <img
              src={club.logoURL}
              alt={`${club.name} logo`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Club Title and Membership Button */}
          <div className="ml-40 md:ml-36 flex-grow">
            <h1 className="text-2xl font-bold">{club.name}</h1>
          </div>

          <div className="mt-4 md:mt-0">
            <Button
              className={
                isMember
                  ? "border-red-200 hover:border-red-300 text-red-500 hover:text-red-600"
                  : "bg-ucscBlue hover:bg-ucscBlue/90"
              }
              variant={isMember ? "outline" : "default"}
              onClick={handleMembershipToggle}
            >
              {isMember ? "Leave Club" : "Join Club"}
            </Button>
          </div>
        </div>

        {/* Club Content Tabs */}
        <Tabs defaultValue="about" className="mb-6">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">About Us</h2>
                    <p className="text-gray-700 mb-6">{club.description}</p>
                    
                    <h3 className="font-semibold mb-2">Meeting Information</h3>
                    <div className="space-y-1 mb-4">
                      <p className="text-sm">
                        <span className="font-medium">Time:</span> {club.clubMeetingTime}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {club.location}
                      </p>
                    </div>
                    
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {club.contactEmail}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Website:</span>{" "}
                        <a
                          href={club.website}
                          className="text-ucscBlue hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {club.website}
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Event</h2>
                <div>
                  <h3 className="font-semibold">GBM Meeting</h3>
                  <p className="text-sm text-gray-500 mb-2">May 20, 2025 • 6:30 PM - 8:30 PM</p>
                  <p className="text-sm mb-2">Engineering 2, Room 215</p>
                  <p className="text-sm text-gray-600">
                    Attend our General Body Meeting to learn more and meet other club members!
                  </p>
                  <Button
                    className="mt-4 w-full bg-ucscBlue hover:bg-ucscBlue/90"
                    size="sm"
                  >
                    RSVP
                  </Button>
                </div>
              </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
{/*
           Posts tab 
          <TabsContent value="posts" className="py-4">
            <div className="space-y-6">
              {club.posts.map((post) => (
                <Card key={post.id} className="slugscene-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="font-medium">
                        <p>{post.authorName}</p>
                        <p className="text-xs text-gray-500">{post.authorRole}</p>
                      </div>
                      <p className="text-xs text-gray-500 ml-auto">
                        {post.timestamp}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-700">{post.content}</p>
                      
                      {post.image && (
                        <div className="mt-4 rounded-md overflow-hidden">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="mt-4 flex items-center space-x-6">
                        <button className="flex items-center text-gray-500 hover:text-ucscBlue transition-colors">
                          <Heart className="h-5 w-5 mr-1" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="text-gray-500 hover:text-ucscBlue transition-colors">
                          {post.comments} Comments
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          events tab 
          <TabsContent value="events" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubData.events.map((event) => (
                <Card key={event.id} className="slugscene-card">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <div className="my-2">
                      <p className="text-sm text-gray-500">
                        {event.date} • {event.time}
                      </p>
                      <p className="text-sm font-medium">{event.location}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {event.description}
                    </p>
                    <Button className="w-full bg-ucscBlue hover:bg-ucscBlue/90">
                      RSVP
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

           Officers Tab 
          <TabsContent value="officers" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clubData.officers.map((officer, index) => (
                <Card key={index} className="slugscene-card">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                      <img
                        src={officer.avatar}
                        alt={officer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{officer.name}</h3>
                    <p className="text-gray-500">{officer.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
  */}

        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ClubProfilePage;
