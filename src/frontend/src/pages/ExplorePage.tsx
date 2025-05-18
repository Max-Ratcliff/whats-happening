
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Explore Clubs page component
 * Allows students to discover and search for clubs
 */

type Club = {
  id: string;
  name: string;
  description: string;
  category: string[];
  contactEmail: string[];
  logoURL: string;
  memberCount: number; 
};

const ExplorePage: React.FC = () => {
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);


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
    useEffect(() => {
      const fetchClubs = async () => {
        const clubsRef = collection(db, "clubs"); //referencing clubs collection
        const snapshot = await getDocs(clubsRef);
        const clubData: Club[] = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
        })) as Club[];
        console.log("Fetched clubs from Firestore:", clubData);
        setClubs(clubData);
      };
      fetchClubs();
    }, []);
      

  // Filter clubs based on search and category
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory =
      activeCategory === null ||
      activeCategory === "All" ||
      club.category.includes(activeCategory);
  
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
                  src={club.logoURL}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{club.name}</h3>
                  <span className="text-xs bg-ucscLightBlue text-ucscBlue rounded-full px-2 py-1">
                    {Array.isArray(club.category) ? club.category.join(", ") : "Uncategorized"}
                  </span>
                <p className="text-sm text-gray-500">
                </p>
                </div>
                <p className="text-gray-600 text-sm mb-4">{club.description}</p>
                <div className="flex justify-between gap-4 mb-4">
                  <Button type='button' className="bg-ucscBlue hover:bg-ucscBlue/90 w-full">
                    Join Club
                  </Button>
                  <Button type='button' className="bg-ucscBlue hover:bg-ucscBlue/90 w-full"
                    onClick={() => {navigate(`/clubs/${club.id}`)}}
                    >
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
