
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/**
 * Officer Portal - Club Profile Management component
 * Allows officers to update club profile information
 */
const OfficerPortalProfile: React.FC = () => {
  // Club data state (would be fetched from API in a real app)
  const [club, setClub] = useState({
    name: "Robotics Club",
    description:
      "The UCSC Robotics Club is dedicated to designing, building, and programming robots for competitions and exhibitions. We welcome students of all skill levels and backgrounds who are interested in robotics, engineering, and technology.",
    meetingTime: "Wednesdays, 6:30 PM - 8:30 PM",
    location: "Engineering 2, Room 180",
    contactEmail: "robotics@ucsc.edu",
    website: "https://robotics.ucsc.edu",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call to update the club
    toast.success("Club profile updated successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Club Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Club Information */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Club Name
                </label>
                <Input
                  value={club.name}
                  onChange={(e) => setClub({ ...club, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={club.description}
                  onChange={(e) => setClub({ ...club, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Club Images */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-lg">Club Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Club Logo
                  </label>
                  <div className="h-40 w-40 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={club.logo}
                      alt="Club Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline" type="button">
                    Upload New Logo
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Cover Image
                  </label>
                  <div className="h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={club.coverImage}
                      alt="Cover Image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline" type="button">
                    Upload New Cover
                  </Button>
                </div>
              </div>
            </div>

            {/* Meeting Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Meeting Details</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meeting Time
                </label>
                <Input
                  value={club.meetingTime}
                  onChange={(e) => setClub({ ...club, meetingTime: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <Input
                  value={club.location}
                  onChange={(e) => setClub({ ...club, location: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Email
                </label>
                <Input
                  value={club.contactEmail}
                  onChange={(e) => setClub({ ...club, contactEmail: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website (optional)
                </label>
                <Input
                  value={club.website}
                  onChange={(e) => setClub({ ...club, website: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button className="bg-ucscBlue hover:bg-ucscBlue/90" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfficerPortalProfile;
