
import React, { useState } from "react";
import { Link, useParams, Outlet } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Officer Portal page component
 * Provides club management tools for officers
 */
const OfficerPortalPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  
  // Mock club data - In a real app, this would be fetched based on the id
  const clubData = {
    id: parseInt(clubId || "1"),
    name: "Robotics Club",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    role: "President", // User's role in this club
  };

  // Navigation items for the officer portal sidebar
  const navItems = [
    { name: "Dashboard", path: `/officer/${clubId}` },
    { name: "Manage Profile", path: `/officer/${clubId}/profile` },
    { name: "Create Post", path: `/officer/${clubId}/post` },
    { name: "Manage Events", path: `/officer/${clubId}/events` },
    { name: "View Members", path: `/officer/${clubId}/members` },
  ];

  return (
    <PageLayout>
      <div className="app-container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full overflow-hidden">
              <img
                src={clubData.logo}
                alt={clubData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{clubData.name} Officer Portal</h1>
              <p className="text-sm text-gray-500">
                Logged in as: {clubData.role}
              </p>
            </div>
          </div>
          <Link to={`/clubs/${clubId}`}>
            <Button variant="outline">View Public Page</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className="p-4 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <Outlet /> {/* This will render the nested routes */}
            
            {/* Default content when no nested route is active */}
            {window.location.pathname === `/officer/${clubId}` && (
              <Card>
                <CardHeader>
                  <CardTitle>Officer Dashboard</CardTitle>
                  <CardDescription>
                    Manage your club and access officer tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      className="h-auto py-6 flex flex-col items-center justify-center bg-ucscBlue hover:bg-ucscBlue/90"
                      asChild
                    >
                      <Link to={`/officer/${clubId}/post`}>
                        <span className="text-lg mb-2">Create Post</span>
                        <span className="text-sm text-white/80">
                          Share updates with club members
                        </span>
                      </Link>
                    </Button>
                    
                    <Button 
                      className="h-auto py-6 flex flex-col items-center justify-center bg-ucscBlue hover:bg-ucscBlue/90"
                      asChild
                    >
                      <Link to={`/officer/${clubId}/events`}>
                        <span className="text-lg mb-2">Manage Events</span>
                        <span className="text-sm text-white/80">
                          Create or edit club events
                        </span>
                      </Link>
                    </Button>
                    
                    <Button 
                      className="h-auto py-6 flex flex-col items-center justify-center bg-ucscBlue hover:bg-ucscBlue/90"
                      asChild
                    >
                      <Link to={`/officer/${clubId}/profile`}>
                        <span className="text-lg mb-2">Club Profile</span>
                        <span className="text-sm text-white/80">
                          Update club details and images
                        </span>
                      </Link>
                    </Button>
                    
                    <Button 
                      className="h-auto py-6 flex flex-col items-center justify-center bg-ucscBlue hover:bg-ucscBlue/90"
                      asChild
                    >
                      <Link to={`/officer/${clubId}/members`}>
                        <span className="text-lg mb-2">Members</span>
                        <span className="text-sm text-white/80">
                          View and manage club members
                        </span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OfficerPortalPage;
