
import React, { useState } from "react";
import { format } from "date-fns";
import PageLayout from "@/components/layout/PageLayout";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Calendar page component
 * Displays club events in a calendar view
 */
const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Mock event data
  type Event = {
    id: number;
    title: string;
    date: Date;
    time: string;
    location: string;
    description: string;
    club: {
      id: number;
      name: string;
      logo: string;
    };
  };

  // Generate some demo events for the current month
  const generateDemoEvents = (): Event[] => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const events: Event[] = [
      {
        id: 1,
        title: "Arduino Workshop",
        date: new Date(thisYear, thisMonth, 20),
        time: "6:30 PM - 8:30 PM",
        location: "Engineering 2, Room 180",
        description: "Learn the basics of Arduino programming and how to control simple components.",
        club: {
          id: 1,
          name: "Robotics Club",
          logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        },
      },
      {
        id: 2,
        title: "Photography Hike",
        date: new Date(thisYear, thisMonth, 21),
        time: "10:00 AM - 2:00 PM",
        location: "UCSC Arboretum",
        description: "Join us for a nature photography hike around campus! Bring your cameras and creativity.",
        club: {
          id: 2,
          name: "Photography Club",
          logo: "https://images.unsplash.com/photo-1493967798781-59dc9f3c3b84",
        },
      },
      {
        id: 3,
        title: "Web Dev Workshop",
        date: new Date(thisYear, thisMonth, 23),
        time: "6:00 PM - 8:00 PM",
        location: "Engineering 2, Room 192",
        description: "Workshop on Web Development basics. Learn HTML, CSS, and JavaScript fundamentals.",
        club: {
          id: 3,
          name: "Computer Science Society",
          logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
        },
      },
      {
        id: 4,
        title: "Open Mic Night",
        date: new Date(thisYear, thisMonth, 24),
        time: "7:30 PM - 10:00 PM",
        location: "Cowell College",
        description: "Share your talents with the community! Sing, play an instrument, recite poetry, or perform comedy.",
        club: {
          id: 8,
          name: "Music Club",
          logo: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
        },
      },
      {
        id: 5,
        title: "Beach Cleanup",
        date: new Date(thisYear, thisMonth, 28),
        time: "9:00 AM - 12:00 PM",
        location: "Natural Bridges State Beach",
        description: "Join us as we help clean up the beach and protect our local marine environment.",
        club: {
          id: 5,
          name: "Environmental Action",
          logo: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
        },
      },
      {
        id: 6,
        title: "Robot Design Challenge",
        date: new Date(thisYear, thisMonth + 1, 5),
        time: "1:00 PM - 5:00 PM",
        location: "Engineering 2, Lab 192",
        description: "Team-based competition to design and build a robot that can navigate an obstacle course.",
        club: {
          id: 1,
          name: "Robotics Club",
          logo: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        },
      },
    ];

    return events;
  };

  const events = generateDemoEvents();

  // Get events for the selected date
  const getEventsForDate = (date: Date | undefined): Event[] => {
    if (!date) return [];
    
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  // Get dates with events for highlighting in the calendar
  const getDatesWithEvents = () => {
    return events.map(event => event.date);
  };

  // Handle event click to show dialog
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  return (
    <PageLayout>
      <div className="app-container py-6">
        <h1 className="text-2xl font-bold mb-6">Event Calendar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {date ? format(date, "MMMM yyyy") : "Select a date"}
                </h2>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="pointer-events-auto"
                  classNames={{
                    day_selected: "bg-ucscBlue text-white hover:bg-ucscBlue hover:text-white",
                    day_today: "border border-ucscGold bg-transparent text-foreground",
                  }}
                  modifiers={{
                    highlighted: getDatesWithEvents(),
                  }}
                  modifiersClassNames={{
                    highlighted: "border-2 border-ucscGold",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Event List Column */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  Events for {date ? format(date, "MMMM d, yyyy") : "selected date"}
                </h2>
              </CardHeader>
              <CardContent>
                {getEventsForDate(date).length > 0 ? (
                  <div className="space-y-4">
                    {getEventsForDate(date).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            <img
                              src={event.club.logo}
                              alt={event.club.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {event.club.name}
                          </span>
                        </div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.time}</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled for this date
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly events overview */}
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  Upcoming this month
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter(event => 
                      event.date.getMonth() === new Date().getMonth() &&
                      event.date >= new Date()
                    )
                    .slice(0, 3)
                    .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex-shrink-0 w-10 text-center">
                        <div className="font-bold text-lg">{event.date.getDate()}</div>
                        <div className="text-xs">{format(event.date, "EEE")}</div>
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.club.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setDate(new Date())}>
                  Back to Today
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={selectedEvent.club.logo}
                      alt={selectedEvent.club.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedEvent.club.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Date:</span>{" "}
                    {format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Time:</span> {selectedEvent.time}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Location:</span>{" "}
                    {selectedEvent.location}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Description:</span>{" "}
                    {selectedEvent.description}
                  </p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button className="flex-1 bg-ucscBlue hover:bg-ucscBlue/90">
                    RSVP
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default CalendarPage;
