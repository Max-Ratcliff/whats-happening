
import React from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * My Clubs page component
 * Shows the clubs that the user has joined
 */
const MyClubsPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for user's joined clubs
  const myClubs = [
    {
      id: 1,
      name: "Robotics Club",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      role: "Member",
      joined: "Sep 2024",
      nextEvent: "Workshop - May 20, 2025",
    },
    {
      id: 3,
      name: "Computer Science Society",
      logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      role: "Officer",
      joined: "Jan 2024",
      nextEvent: "Hackathon - Jun 5, 2025",
    },
    {
      id: 5,
      name: "Environmental Action",
      logo: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      role: "Member",
      joined: "Apr 2025",
      nextEvent: "Beach Cleanup - May 28, 2025",
    },
  ];

  // Handle leaving a club
  const handleLeaveClub = (clubId: number, clubName: string) => {
    // In a real app, this would be an API call
    toast.success(`You have left ${clubName}`);
    // Would update the state to remove the club
  };

  return (
    <PageLayout>
      <div className="app-container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Clubs</h1>
          <Button 
            onClick={() => navigate("/explore")}
            className="bg-ucscBlue hover:bg-ucscBlue/90"
          >
            Find New Clubs
          </Button>
        </div>

        {/* Club Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClubs.map((club) => (
            <Card key={club.id} className="slugscene-card">
              <CardContent className="p-0">
                <div className="h-36 bg-gray-100">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{club.name}</h3>
                    <span className="text-xs bg-ucscLightBlue text-ucscBlue rounded-full px-2 py-1">
                      {club.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Joined: {club.joined}
                  </p>
                  <p className="text-sm font-medium mb-4">
                    Next: {club.nextEvent}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-ucscBlue hover:bg-ucscBlue/90"
                      onClick={() => navigate(`/clubs/${club.id}`)}
                    >
                      View Club
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                      onClick={() => handleLeaveClub(club.id, club.name)}
                    >
                      Leave
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {myClubs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">You haven't joined any clubs yet</h3>
              <p className="text-gray-500 mb-4">
                Discover and join clubs to see them here
              </p>
              <Button 
                onClick={() => navigate("/explore")}
                className="bg-ucscBlue hover:bg-ucscBlue/90"
              >
                Explore Clubs
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MyClubsPage;
