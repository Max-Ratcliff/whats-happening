
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search } from "lucide-react";

/**
 * Officer Portal - View Members component
 * Allows officers to manage club members
 */
const OfficerPortalMembers: React.FC = () => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Member role management state
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  
  // Mock member data - In a real app, this would be fetched from an API
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Alex Rodriguez",
      email: "arodriguez@ucsc.edu",
      joined: "Sep 15, 2024",
      role: "President",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    },
    {
      id: 2,
      name: "Jamie Chen",
      email: "jchen@ucsc.edu",
      joined: "Sep 20, 2024",
      role: "Vice President",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    },
    {
      id: 3,
      name: "Taylor Kim",
      email: "tkim@ucsc.edu",
      joined: "Oct 5, 2024",
      role: "Treasurer",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
    },
    {
      id: 4,
      name: "Jordan Smith",
      email: "jsmith@ucsc.edu",
      joined: "Oct 12, 2024",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    },
    {
      id: 5,
      name: "Casey Johnson",
      email: "cjohnson@ucsc.edu",
      joined: "Nov 3, 2024",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    },
    {
      id: 6,
      name: "Morgan Williams",
      email: "mwilliams@ucsc.edu",
      joined: "Nov 15, 2024",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
    {
      id: 7,
      name: "Riley Garcia",
      email: "rgarcia@ucsc.edu",
      joined: "Jan 8, 2025",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
  ]);

  // Filter members based on search query
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle member role change
  const changeRole = (memberId: number, newRole: string) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    toast.success("Member role updated successfully");
    setSelectedMemberId(null);
  };

  // Handle member removal
  const removeMember = (memberId: number) => {
    if (confirm("Are you sure you want to remove this member from the club?")) {
      setMembers(members.filter((member) => member.id !== memberId));
      toast.success("Member removed from club");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Club Members</CardTitle>
        <div className="text-sm text-gray-500">
          Total Members: {members.length}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members by name, email, or role"
            className="pl-10"
          />
        </div>

        {/* Members Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.joined}</TableCell>
                  <TableCell>
                    {selectedMemberId === member.id ? (
                      <select
                        className="border rounded-md px-2 py-1 text-sm"
                        value={member.role}
                        onChange={(e) => changeRole(member.id, e.target.value)}
                        autoFocus
                        onBlur={() => setSelectedMemberId(null)}
                      >
                        <option value="Member">Member</option>
                        <option value="Officer">Officer</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Vice President">Vice President</option>
                        <option value="President">President</option>
                      </select>
                    ) : (
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => setSelectedMemberId(member.id)}
                      >
                        {member.role}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMemberId(member.id)}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => removeMember(member.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No members found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" size="sm">
            Export Member List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficerPortalMembers;
