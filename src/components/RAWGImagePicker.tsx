"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RAWGResult = {
  id: number;
  name: string;
  image: string;
  released: string;
  rating: number;
};

type Props = {
  gameName: string;
  onSelectImage: (imageUrl: string) => void;
  currentImage?: string;
};

export default function RAWGImagePicker({
  gameName,
  onSelectImage,
  currentImage,
}: Props) {
  const [searchQuery, setSearchQuery] = useState(gameName);
  const [results, setResults] = useState<RAWGResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(currentImage || "");
  const [error, setError] = useState("");

  // Auto-search when gameName changes
  useEffect(() => {
    if (gameName && gameName !== searchQuery) {
      setSearchQuery(gameName);
      handleSearch(gameName);
    }
  }, [gameName]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/games/search-rawg?query=${encodeURIComponent(searchTerm)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search");
      }

      const data = await response.json();
      setResults(data.results || []);

      if (data.results.length === 0) {
        setError("No games found. Try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onSelectImage(imageUrl);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Tìm trò chơi trên RAWG…"
          aria-label="Tìm ảnh trò chơi trên RAWG"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1 min-w-0 h-11 bg-[var(--field)] text-[var(--ink)] border-[var(--line)] placeholder:text-[var(--secondary)] focus-visible:ring-[var(--highlight)]"
        />
        <Button
          type="button"
          onClick={() => handleSearch()}
          disabled={loading || !searchQuery.trim()}
          variant="outline"
          aria-label="Tìm ảnh"
          className="h-11 w-11 shrink-0 border-[var(--line)] bg-[var(--page)] text-[var(--ink)] hover:bg-[var(--panel)] hover:text-[var(--ink)]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-[var(--danger)] border border-[var(--line)] rounded-lg p-3" role="alert">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--secondary)]">
            {results.length} kết quả. Nhấn ảnh để chọn.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {results.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelectImage(game.image)}
                className={`relative group rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                  selectedImage === game.image
                    ? "border-[var(--highlight)] ring-2 ring-[var(--highlight)]"
                    : "border-[var(--line)] hover:border-[var(--highlight)]"
                }`}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white font-semibold line-clamp-2">
                        {game.name}
                      </p>
                      <p className="text-xs text-slate-300">
                        {game.rating} điểm · {game.released?.split("-")[0]}
                      </p>
                    </div>
                  </div>
                  {/* Selected Indicator */}
                  {selectedImage === game.image && (
                    <div className="absolute top-2 right-2 bg-[var(--button)] rounded-full p-1">
                      <Check className="w-4 h-4 text-[var(--button-ink)]" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-3">
          <p className="text-sm text-[var(--highlight)] mb-2">Đã chọn ảnh</p>
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full max-w-xs rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
