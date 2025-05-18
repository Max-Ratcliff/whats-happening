import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import PageLayout from "@/components/layout/PageLayout";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added for consistency
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Users as UsersIcon } from "lucide-react"; // Renamed Users to UsersIcon to avoid conflict
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp, // Firestore Timestamp for type and conversion
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your Firebase db instance

// Interface for events fetched from Firestore, matching your document structure
interface FetchedEvent {
  id: string; // Firestore document ID
  title: string;
  description: string;
  startTime: Timestamp; // From your Firestore document
  endTime?: Timestamp; // Optional, from your Firestore document
  location: string;
  clubId: string;
  clubName: string;
  clubLogo?: string; // Assuming this might be added to your events or fetched via clubId
  createdAt?: Timestamp; // From your Firestore document
}

const CalendarPage: React.FC = () => {
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | undefined>(new Date());
  const [allEvents, setAllEvents] = useState<FetchedEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEventDetails, setSelectedEventDetails] = useState<FetchedEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const eventsRef = collection(db, "events"); 
        const q = query(eventsRef, orderBy("startTime", "asc")); // Order by your 'startTime' field
        const snapshot = await getDocs(q);
        const eventData: FetchedEvent[] = snapshot.docs.map((doc): FetchedEvent => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            title: data.title || "Untitled Event",
            description: data.description || "No description provided.",
            startTime: data.startTime as Timestamp, // Matches your Firestore field
            endTime: data.endTime as Timestamp, // Matches your Firestore field (optional)
            location: data.location || "TBD",
            clubId: data.clubId || "",
            clubName: data.clubName || "Unknown Club",
            clubLogo: data.clubLogo, // Assumes you might add this to event docs or fetch separately
            createdAt: data.createdAt as Timestamp, // Matches your Firestore field (optional)
          };
        });
        setAllEvents(eventData);
      } catch (err) {
        console.error("Error fetching events from Firestore:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch events.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventsForDate = (selectedDate: Date | undefined): FetchedEvent[] => {
    if (!selectedDate || !allEvents) return [];
    return allEvents.filter((event) => {
      if (!event.startTime) return false;
      const eventDate = event.startTime.toDate();
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const getDatesWithEvents = (): Date[] => {
    return allEvents.map(event => event.startTime.toDate());
  };

  const handleEventClick = (event: FetchedEvent) => {
    setSelectedEventDetails(event);
    setShowEventDialog(true);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="app-container py-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-ucscBlue" />
          <p className="ml-4 text-xl">Loading Event Calendar...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="app-container py-6 text-center">
          <p className="text-red-500 text-xl mb-3">Could not load events.</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => { /* Implement refetch logic if desired */ }}>Try Again</Button>
        </div>
      </PageLayout>
    );
  }

  const eventsOnSelectedDate = getEventsForDate(currentSelectedDate);

  return (
    <PageLayout>
      <div className="app-container py-6 px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-ucscBlue">Event Calendar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-1 sm:p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={currentSelectedDate}
                  onSelect={setCurrentSelectedDate}
                  className="pointer-events-auto w-full [&_button]:text-base" // Ensure it takes space, adjust text size
                  classNames={{
                    day_selected: "bg-ucscBlue text-white hover:bg-ucscBlue hover:text-white rounded-md",
                    day_today: "border-2 border-ucscGold text-ucscGold rounded-md",
                    day_outside: "text-muted-foreground opacity-50",
                     head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.9rem]",
                     nav_button: "h-9 w-9", // Adjusted nav button size
                     cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-ucscBlue/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  }}
                  modifiers={{
                    highlighted: getDatesWithEvents(),
                  }}
                  modifiersClassNames={{
                    highlighted: "bg-ucscGold/20 !text-ucscGold-dark font-semibold rounded-md",
                  }}
                  showOutsideDays={true}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-semibold text-ucscBlue">
                  Events for {currentSelectedDate ? format(currentSelectedDate, "MMMM d, yyyy") : "selected date"}
                </h2>
              </CardHeader>
              <CardContent>
                {eventsOnSelectedDate.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {eventsOnSelectedDate.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-slate-100 cursor-pointer transition-colors shadow-sm hover:shadow-md"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center space-x-3 mb-1.5">
                          {event.clubLogo ? (
                            <img
                              src={event.clubLogo}
                              alt={event.clubName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                              <UsersIcon size={16}/>
                            </div>
                          )}
                          <span className="text-xs font-medium text-gray-700">
                            {event.clubName}
                          </span>
                        </div>
                        <h3 className="font-semibold text-md text-ucscBlue">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(event.startTime.toDate(), "p")}
                          {event.endTime && ` - ${format(event.endTime.toDate(), "p")}`}
                        </p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled for this date.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-lg"> {/* Adjusted width */}
          {selectedEventDetails && (
            <>
              <DialogHeader className="mb-3">
                <DialogTitle className="text-2xl font-bold text-ucscBlue">{selectedEventDetails.title}</DialogTitle>
                 <div className="flex items-center space-x-2 pt-1">
                    {selectedEventDetails.clubLogo ? (
                        <img
                        src={selectedEventDetails.clubLogo}
                        alt={selectedEventDetails.clubName}
                        className="h-6 w-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                           <UsersIcon size={12}/>
                        </div>
                    )}
                    <p className="text-sm text-gray-600">{selectedEventDetails.clubName}</p>
                </div>
              </DialogHeader>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {format(selectedEventDetails.startTime.toDate(), "EEEE, MMMM d, yyyy")}
                </p>
                <p>
                  <span className="font-semibold">Time:</span> {format(selectedEventDetails.startTime.toDate(), "p")}
                  {selectedEventDetails.endTime && ` - ${format(selectedEventDetails.endTime.toDate(), "p")}`}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedEventDetails.location}
                </p>
                {selectedEventDetails.description && (
                    <div className="pt-2">
                        <h4 className="font-semibold mb-1">Description:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEventDetails.description}</p>
                    </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-5 mt-4 border-t">
                <Button className="flex-1 bg-ucscBlue hover:bg-ucscBlue/90" onClick={() => alert("RSVP feature coming soon!")}>
                  RSVP
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => alert("Add to calendar feature coming soon!")}>
                  Add to My Calendar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default CalendarPage;
