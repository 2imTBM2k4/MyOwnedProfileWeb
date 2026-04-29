"use client";

import { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";

type Props = {
  title: string;
  imageUrl?: string | null;
  className?: string;
};

/**
 * GameCover component that automatically fetches cover from RAWG API
 * if no image URL is provided
 */
export default function GameCover({ title, imageUrl, className = "" }: Props) {
  const [coverUrl, setCoverUrl] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState(!imageUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have an image, don't fetch
    if (imageUrl) {
      setCoverUrl(imageUrl);
      setLoading(false);
      return;
    }

    // Fetch from RAWG API
    const fetchCover = async () => {
      try {
        const response = await fetch(
          `/api/games/search-rawg?query=${encodeURIComponent(title)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          setCoverUrl(data.results[0].image);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch game cover:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCover();
  }, [title, imageUrl]);

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center ${className}`}
      >
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !coverUrl) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center ${className}`}
      >
        <Gamepad2 className="w-10 h-10 text-blue-500/20" />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={title}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
