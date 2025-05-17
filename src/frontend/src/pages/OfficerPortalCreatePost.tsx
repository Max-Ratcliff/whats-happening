
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/**
 * Officer Portal - Create Post component
 * Allows officers to create new posts for their club
 */
const OfficerPortalCreatePost: React.FC = () => {
  // Post content state
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate post content
    if (!content.trim()) {
      toast.error("Please enter post content");
      return;
    }

    // In a real app, this would make an API call to create the post
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Post created successfully!");
      
      // Reset form
      setContent("");
      setImagePreview(null);
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Post Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update with your club members..."
              rows={6}
              className="w-full resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} / 1000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add Image (Optional)
            </label>
            
            {imagePreview ? (
              <div className="space-y-2">
                <div className="relative rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">
                    Click to upload an image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Post Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Post Options</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifyMembers"
                className="rounded border-gray-300"
              />
              <label htmlFor="notifyMembers" className="text-sm">
                Send notification to club members
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pinPost"
                className="rounded border-gray-300"
              />
              <label htmlFor="pinPost" className="text-sm">
                Pin to top of club profile
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button 
              className="bg-ucscBlue hover:bg-ucscBlue/90" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfficerPortalCreatePost;
