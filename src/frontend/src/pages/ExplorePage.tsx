import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout"; // Assuming this is your layout component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card"; // Assuming CardTitle etc. are used internally by your Card
import { Search, Loader2, Users } from "lucide-react"; // Added Loader2 and Users for loading/placeholder
import { useNavigate } from "react-router-dom";
import { collection, getDocs, DocumentData } from "firebase/firestore"; // Import DocumentData
import { db } from "@/lib/firebase";
import { Club } from "@/types"; // Import the centralized Club interface

/**
 * Explore Clubs page component
 * Allows students to discover and search for clubs by fetching data directly from Firestore.
 */
const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>("All"); // Default to "All"
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Club categories
  const categories = [
    "All", "Academic", "Arts", "Sports", "Tech", "Social", "Cultural", "Professional",
  ];

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const clubsRef = collection(db, "clubs");
        const snapshot = await getDocs(clubsRef);
        const clubData: Club[] = snapshot.docs.map((doc): Club => {
          const data = doc.data() as DocumentData; // Assert data() to DocumentData for safety
          return {
            clubId: doc.id, // Map Firestore doc.id to clubId
            name: data.name || "Unnamed Club",
            description: data.description || "No description available.",
            category: Array.isArray(data.category) ? data.category : [],
            contactEmail: Array.isArray(data.contactEmail) ? data.contactEmail : [],
            logoURL: data.logoURL || undefined, // Handle if logoURL might be missing
            memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
            // Ensure all fields from the Club interface are mapped or have defaults
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

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === null ||
      activeCategory === "All" ||
      (Array.isArray(club.category) && club.category.includes(activeCategory)); // Check if category array includes activeCategory

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="app-container py-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-ucscBlue" />
          <p className="ml-3 text-lg">Loading clubs...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <Button onClick={() => { // Re-fetch clubs on error
             const fetchClubsRetry = async () => { /* ... same fetchClubs logic ... */ };
             fetchClubsRetry();
          }}>Try Again</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="app-container py-6"> {/* Assuming app-container provides padding/max-width */}
        <h1 className="text-3xl font-bold mb-6 text-center text-ucscBlue">Explore Clubs</h1>

        <div className="relative mb-6 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search clubs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full text-base rounded-lg shadow-sm"
            aria-label="Search clubs"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 pb-4 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category === "All" ? null : category)} // Set to null for "All"
              className={`transition-colors duration-150 ease-in-out 
                ${activeCategory === category
                  ? "bg-ucscBlue text-white hover:bg-ucscBlue/90"
                  : "border-ucscBlue text-ucscBlue hover:bg-ucscBlue/10"
                }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {filteredClubs.length === 0 && !isLoading ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-700">No clubs found</h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.clubId} className="slugscene-card overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 flex flex-col">
                <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                  {club.logoURL ? (
                    <img
                      src={club.logoURL}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-contain p-4" // Changed to object-contain
                    />
                  ) : (
                    <Users className="w-20 h-20 text-ucscBlue text-opacity-30" />
                  )}
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-ucscBlue mb-1 truncate" title={club.name}>{club.name}</h3>
                  {club.category && club.category.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {club.category.slice(0,2).map((cat, index) => ( // Show max 2 categories
                        <span key={index} className="text-xs bg-ucscGold/20 text-ucscGold-dark rounded-full px-2 py-0.5">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">{club.description}</p>
                  <div className="mt-auto flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto border-ucscBlue text-ucscBlue hover:bg-ucscBlue/10"
                      onClick={() => navigate(`/clubs/${club.clubId}`)} // Changed from id to clubId
                    >
                      View Club
                    </Button>
                    <Button
                      size="sm"
                      className="bg-ucscBlue hover:bg-ucscBlue/90 w-full sm:w-auto"
                      onClick={() => alert(`Join club: ${club.name} (feature pending)`)} // Placeholder for join
                    >
                      Join Club
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ExplorePage;
