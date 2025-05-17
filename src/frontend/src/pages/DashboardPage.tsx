
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Heart } from "lucide-react";

/**
 * Dashboard/Home page component
 * Shows a feed of club updates and upcoming events
 */
const DashboardPage: React.FC = () => {
  // Mock data for club posts
  const clubPosts = [
    {
      id: 1,
      clubName: "Robotics Club",
      clubAvatar: "https://images.unsplash.com/photo-1518770660439-4636190af475", 
      timestamp: "Today at 2:45 PM",
      content:
        "Our robot design won first place at the UC robotics competition! Thanks to all members who contributed to the project.",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      clubName: "Photography Club",
      clubAvatar: "https://images.unsplash.com/photo-1493967798781-59dc9f3c3b84",
      timestamp: "Yesterday at 10:30 AM",
      content:
        "Join us this Saturday for our nature photography hike around campus! Bring your cameras and creativity. All skill levels welcome!",
      likes: 18,
      comments: 5,
    },
    {
      id: 3,
      clubName: "Computer Science Society",
      clubAvatar: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      timestamp: "2 days ago",
      content:
        "Workshop alert! 'Intro to Web Development' happening next Tuesday at 6PM in Engineering 2, Room 192. RSVP through the link in bio.",
      image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2",
      likes: 45,
      comments: 12,
    },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Robotics Workshop",
      date: "May 20, 2025",
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
    {
      id: 3,
      title: "Web Dev Workshop",
      date: "May 23, 2025",
      time: "6:00 PM",
      location: "Engineering 2, Room 192",
      club: "Computer Science Society",
    },
    {
      id: 4,
      title: "Open Mic Night",
      date: "May 24, 2025",
      time: "7:30 PM",
      location: "Cowell College",
      club: "Music Club",
    },
  ];

  return (
    <PageLayout>
      <div className="app-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold">Latest Updates</h1>

            {/* Club Posts */}
            {clubPosts.map((post) => (
              <Card key={post.id} className="slugscene-card">
                <CardHeader className="flex flex-row items-center space-x-4 pb-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img 
                      src={post.clubAvatar} 
                      alt={post.clubName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{post.clubName}</h3>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p>{post.content}</p>
                    
                    {/* Optional Post Image */}
                    {post.image && (
                      <div className="rounded-md overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 pt-2">
                      <button className="flex items-center text-gray-500 hover:text-ucscBlue transition-colors">
                        <Heart className="h-5 w-5 mr-1" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="text-gray-500 hover:text-ucscBlue transition-colors">
                        {post.comments} Comments
                      </button>
                      <div className="ml-auto">
                        <Button variant="outline" size="sm">
                          View Club
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-6">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-ucscBlue" />
                    Upcoming Events
                  </h2>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="px-6 py-4 hover:bg-gray-50"
                      >
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-sm text-gray-500">
                          {event.club} • {event.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Academic", "Arts", "Sports", "Tech", "Social", "Cultural"].map((category) => (
                      <Button 
                        key={category} 
                        variant="outline" 
                        className="text-sm"
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
