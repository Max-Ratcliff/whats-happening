
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Officer Portal - Manage Events component
 * Allows officers to create and manage club events
 */
const OfficerPortalEvents: React.FC = () => {
  // Event list and form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);

  // New event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
  });

  // Mock event data - In a real app, this would be fetched from an API
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Arduino Workshop",
      date: "2025-05-20",
      startTime: "18:30",
      endTime: "20:30",
      location: "Engineering 2, Room 180",
      description:
        "Learn the basics of Arduino programming and how to control simple components.",
    },
    {
      id: 2,
      title: "Robot Design Challenge",
      date: "2025-06-05",
      startTime: "13:00",
      endTime: "17:00",
      location: "Engineering 2, Lab 192",
      description:
        "Team-based competition to design and build a robot that can navigate an obstacle course.",
    },
    {
      id: 3,
      title: "End of Year Showcase",
      date: "2025-06-15",
      startTime: "16:00",
      endTime: "19:00",
      location: "Engineering 2 Courtyard",
      description:
        "Showcase of all the projects our members have worked on throughout the year.",
    },
  ]);

  // Reset form fields
  const resetForm = () => {
    setEventForm({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
    });
  };

  // Open dialog to create new event
  const openCreateDialog = () => {
    resetForm();
    setIsEditing(false);
    setCurrentEventId(null);
    setIsDialogOpen(true);
  };

  // Open dialog to edit event
  const openEditDialog = (event: any) => {
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
    });
    setIsEditing(true);
    setCurrentEventId(event.id);
    setIsDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isEditing && currentEventId) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === currentEventId ? { ...eventForm, id: currentEventId } : event
        )
      );
      toast.success("Event updated successfully");
    } else {
      // Create new event
      const newEvent = {
        ...eventForm,
        id: Date.now(), // Generate a unique ID
      };
      setEvents([...events, newEvent]);
      toast.success("Event created successfully");
    }

    setIsDialogOpen(false);
  };

  // Handle event deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== id));
      toast.success("Event deleted successfully");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Events</CardTitle>
          <Button 
            onClick={openCreateDialog}
            className="bg-ucscBlue hover:bg-ucscBlue/90"
          >
            Create New Event
          </Button>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.startTime} - {event.endTime}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(event)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No events scheduled. Click "Create New Event" to add one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Title *
              </label>
              <Input
                name="title"
                value={eventForm.title}
                onChange={handleInputChange}
                placeholder="e.g., Arduino Workshop"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <Input
                  name="date"
                  type="date"
                  value={eventForm.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time *
                  </label>
                  <Input
                    name="startTime"
                    type="time"
                    value={eventForm.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <Input
                    name="endTime"
                    type="time"
                    value={eventForm.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <Input
                name="location"
                value={eventForm.location}
                onChange={handleInputChange}
                placeholder="e.g., Engineering 2, Room 180"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                name="description"
                value={eventForm.description}
                onChange={handleInputChange}
                placeholder="Provide details about the event..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-ucscBlue hover:bg-ucscBlue/90"
              >
                {isEditing ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerPortalEvents;
