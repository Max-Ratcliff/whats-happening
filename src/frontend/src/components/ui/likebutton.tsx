import { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  initialCount: number;
}

export default function LikeButton({ initialCount }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(initialCount);
  const [liked, setLiked] = useState<boolean>(false);

  const handleClick = () => {
    setLikes(liked ? likes - 1 : likes + 1);
    setLiked(!liked);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center transition-colors ${
        liked ? "text-red-500" : "text-gray-600 hover:text-ucscBlue"
      }`}
    >
      <Heart
        className="h-4 w-4 mr-1.5"
        fill={liked ? "#ef4444" : "none"}
      />
      <span>{likes} Likes</span>
    </button>
  );
}

