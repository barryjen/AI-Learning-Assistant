import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  MessageSquare,
  X,
  SlidersHorizontal
} from "lucide-react";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: SearchFilters) => void;
  searchPlaceholder?: string;
  showAdvanced?: boolean;
}

interface SearchFilters {
  mode?: string;
  dateRange?: string;
  tags?: string[];
  hasImages?: boolean;
  hasCode?: boolean;
  rating?: string;
}

const FILTER_MODES = [
  { value: "all", label: "All Modes" },
  { value: "general", label: "General" },
  { value: "tutor", label: "Tutor" },
  { value: "creative", label: "Creative" },
  { value: "code", label: "Code" },
  { value: "research", label: "Research" }
];

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" }
];

const RATING_FILTERS = [
  { value: "all", label: "All Ratings" },
  { value: "positive", label: "Positive Only" },
  { value: "negative", label: "Negative Only" },
  { value: "unrated", label: "Unrated" }
];

export function SearchFilter({ 
  onSearch, 
  onFilter, 
  searchPlaceholder = "Search conversations...",
  showAdvanced = false
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== "all" && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleSearch("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {/* Quick Filters */}
        <Select value={filters.mode || "all"} onValueChange={(value) => 
          handleFilterChange({ mode: value === "all" ? undefined : value })
        }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.dateRange || "all"} onValueChange={(value) => 
          handleFilterChange({ dateRange: value === "all" ? undefined : value })
        }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={filters.rating || "all"} onValueChange={(value) => 
                handleFilterChange({ rating: value === "all" ? undefined : value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATING_FILTERS.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.hasImages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange({ hasImages: !filters.hasImages })}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Has Images
                </Button>
                <Button
                  variant={filters.hasCode ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange({ hasCode: !filters.hasCode })}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Has Code
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filters.mode && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Mode: {filters.mode}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange({ mode: undefined })}
                    />
                  </Badge>
                )}
                {filters.dateRange && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Date: {filters.dateRange}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange({ dateRange: undefined })}
                    />
                  </Badge>
                )}
                {filters.rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Rating: {filters.rating}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange({ rating: undefined })}
                    />
                  </Badge>
                )}
                {filters.hasImages && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Has Images
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange({ hasImages: false })}
                    />
                  </Badge>
                )}
                {filters.hasCode && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Has Code
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange({ hasCode: false })}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}