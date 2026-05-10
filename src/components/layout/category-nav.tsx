"use client";

import { CATEGORIES, type EventCategory } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  selectedCategory?: EventCategory | null;
  onCategoryChange?: (category: EventCategory | null) => void;
}

export function CategoryNav({
  selectedCategory = null,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Categories
      </h3>
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange?.(null)}
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm w-full transition-colors",
            !selectedCategory
              ? "bg-accent text-foreground font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          All Events
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange?.(cat.value)}
            className={cn(
              "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm w-full transition-colors",
              selectedCategory === cat.value
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
