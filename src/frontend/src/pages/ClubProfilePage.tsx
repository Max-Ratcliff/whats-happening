
import React, { useState } from "react";
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
import { toast } from "sonner";
import { Heart } from "lucide-react";

/**
 * Club Profile page component
 * Shows detailed information about a specific club
 */
const ClubProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isMember, setIsMember] = useState(true);

  // Mock club data - In a real app, this would be fetched based on the id
  const clubData = {
    id: parseInt(id || "1"),
    name: "Robotics Club",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    description:
      "The UCSC Robotics Club is dedicated to designing, building, and programming robots for competitions and exhibitions. We welcome students of all skill levels and backgrounds who are interested in robotics, engineering, and technology.",
    foundedYear: 2015,
    meetingTime: "Wednesdays, 6:30 PM - 8:30 PM",
    location: "Engineering 2, Room 180",
    contactEmail: "robotics@ucsc.edu",
    website: "https://robotics.ucsc.edu",
    memberCount: 45,
    officers: [
      {
        name: "Alex Rodriguez",
        role: "President",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      },
      {
        name: "Jamie Chen",
        role: "Vice President",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      {
        name: "Taylor Kim",
        role: "Treasurer",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
      },
    ],
    posts: [
      {
        id: 1,
        authorName: "Alex Rodriguez",
        authorRole: "President",
        timestamp: "Today at 2:45 PM",
        content:
          "Our robot design won first place at the UC robotics competition! Thanks to all members who contributed to the project.",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086",
        likes: 24,
        comments: 8,
      },
      {
        id: 2,
        authorName: "Jamie Chen",
        authorRole: "Vice President",
        timestamp: "May 10, 2025",
        content:
          "Workshop announcement! This Wednesday we'll be covering basics of Arduino programming. Bring your laptops and be ready to code!",
        likes: 15,
        comments: 3,
      },
    ],
    events: [
      {
        id: 1,
        title: "Arduino Workshop",
        date: "May 20, 2025",
        time: "6:30 PM - 8:30 PM",
        location: "Engineering 2, Room 180",
        description:
          "Learn the basics of Arduino programming and how to control simple components.",
      },
      {
        id: 2,
        title: "Robot Design Challenge",
        date: "June 5, 2025",
        time: "1:00 PM - 5:00 PM",
        location: "Engineering 2, Lab 192",
        description:
          "Team-based competition to design and build a robot that can navigate an obstacle course.",
      },
      {
        id: 3,
        title: "End of Year Showcase",
        date: "June 15, 2025",
        time: "4:00 PM - 7:00 PM",
        location: "Engineering 2 Courtyard",
        description:
          "Showcase of all the projects our members have worked on throughout the year.",
      },
    ],
  };

  // Handle joining/leaving a club
  const handleMembershipToggle = () => {
    if (isMember) {
      // Leave club logic
      toast.success(`You have left ${clubData.name}`);
    } else {
      // Join club logic
      toast.success(`You have joined ${clubData.name}!`);
    }
    setIsMember(!isMember);
  };

  return (
    <PageLayout>
      {/* Club Cover and Basic Info */}
      <div
        className="h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${clubData.coverImage})` }}
      >
        <div className="h-full w-full bg-black bg-opacity-30"></div>
      </div>

      <div className="app-container">
        {/* Club Header Section */}
        <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end">
          {/* Club Logo */}
          <div className="absolute -top-16 left-4 h-32 w-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
            <img
              src={clubData.logo}
              alt={clubData.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Club Title and Membership Button */}
          <div className="ml-40 md:ml-36 flex-grow">
            <h1 className="text-2xl font-bold">{clubData.name}</h1>
            <p className="text-sm text-gray-500">
              {clubData.memberCount} members • Founded {clubData.foundedYear}
            </p>
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
                    <p className="text-gray-700 mb-6">{clubData.description}</p>
                    
                    <h3 className="font-semibold mb-2">Meeting Information</h3>
                    <div className="space-y-1 mb-4">
                      <p className="text-sm">
                        <span className="font-medium">Time:</span> {clubData.meetingTime}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {clubData.location}
                      </p>
                    </div>
                    
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {clubData.contactEmail}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Website:</span>{" "}
                        <a
                          href={clubData.website}
                          className="text-ucscBlue hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {clubData.website}
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
                    {clubData.events[0] && (
                      <div>
                        <h3 className="font-semibold">{clubData.events[0].title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {clubData.events[0].date} • {clubData.events[0].time}
                        </p>
                        <p className="text-sm mb-2">{clubData.events[0].location}</p>
                        <p className="text-sm text-gray-600">
                          {clubData.events[0].description}
                        </p>
                        <Button
                          className="mt-4 w-full bg-ucscBlue hover:bg-ucscBlue/90"
                          size="sm"
                        >
                          RSVP
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="py-4">
            <div className="space-y-6">
              {clubData.posts.map((post) => (
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

          {/* Events Tab */}
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

          {/* Officers Tab */}
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
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ClubProfilePage;
