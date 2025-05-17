
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

/**
 * Explore Clubs page component
 * Allows students to discover and search for clubs
 */
const ExplorePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Mock data for club categories
  const categories = [
    "All",
    "Academic",
    "Arts",
    "Sports",
    "Tech",
    "Social",
    "Cultural",
    "Professional",
  ];

  // Mock data for clubs
  const clubs = [
    {
      id: 1,
      name: "Robotics Club",
      category: "Tech",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      description: "Building robots and competing in national competitions.",
      memberCount: 45,
    },
    {
      id: 2,
      name: "Photography Club",
      category: "Arts",
      logo: "https://images.unsplash.com/photo-1493967798781-59dc9f3c3b84",
      description: "Capturing the beauty of our campus and beyond.",
      memberCount: 32,
    },
    {
      id: 3,
      name: "Computer Science Society",
      category: "Academic",
      logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      description: "Advancing CS knowledge and building community.",
      memberCount: 78,
    },
    {
      id: 4,
      name: "Slug Soccer",
      category: "Sports",
      logo: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55",
      description: "Competitive and recreational soccer for all levels.",
      memberCount: 54,
    },
    {
      id: 5,
      name: "Environmental Action",
      category: "Social",
      logo: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      description: "Promoting sustainability on campus and beyond.",
      memberCount: 41,
    },
    {
      id: 6,
      name: "Filipino Student Association",
      category: "Cultural",
      logo: "https://images.unsplash.com/photo-1551801691-f0bce83d4f28",
      description: "Celebrating Filipino culture and building community.",
      memberCount: 37,
    },
    {
      id: 7,
      name: "Business Association",
      category: "Professional",
      logo: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5",
      description: "Connecting students with business opportunities.",
      memberCount: 62,
    },
    {
      id: 8,
      name: "Music Club",
      category: "Arts",
      logo: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
      description: "Making music and organizing campus performances.",
      memberCount: 29,
    },
  ];

  // Filter clubs based on search and category
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          club.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === null || 
                            activeCategory === "All" || 
                            club.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout>
      <div className="app-container py-6">
        <h1 className="text-2xl font-bold mb-6">Explore Clubs</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search for clubs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "bg-ucscBlue hover:bg-ucscBlue/90"
                  : ""
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Club Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="slugscene-card overflow-hidden">
              <div className="h-40 bg-gray-100">
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{club.name}</h3>
                  <span className="text-xs bg-ucscLightBlue text-ucscBlue rounded-full px-2 py-1">
                    {club.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{club.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {club.memberCount} members
                  </span>
                  <Button className="bg-ucscBlue hover:bg-ucscBlue/90">
                    View Club
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredClubs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No clubs found</h3>
              <p className="text-gray-500">
                Try adjusting your search or category filters
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ExplorePage;
