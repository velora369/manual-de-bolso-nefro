import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, XIcon } from "lucide-react";

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  matchCount: number;
}

interface SearchBarProps {
  onSearch: (term: string, results: SearchResult[]) => void;
  sections: Array<{ id: string; title: string }>;
  "data-testid"?: string;
}

export default function SearchBar({ onSearch, sections, "data-testid": testId }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);

  const performSearch = (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setTotalMatches(0);
      onSearch(term, []);
      return;
    }

    const results: SearchResult[] = [];
    let total = 0;

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        const content = element.textContent?.toLowerCase() || "";
        const searchLower = term.toLowerCase();
        const matches = (content.match(new RegExp(searchLower, "g")) || []).length;
        
        if (matches > 0) {
          results.push({
            sectionId: section.id,
            sectionTitle: section.title,
            matchCount: matches
          });
          total += matches;
        }
      }
    });

    setSearchResults(results);
    setTotalMatches(total);
    onSearch(term, results);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setTotalMatches(0);
    onSearch("", []);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar termos ou seções..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-10 pr-10 focus:ring-2 focus:ring-ring focus:border-ring"
          data-testid="input-search"
        />
        <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 w-4 h-4 text-muted-foreground hover:text-foreground"
            data-testid="button-clear-search"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Summary */}
      {searchTerm && searchResults.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{totalMatches} resultado(s) encontrado(s)</span>
          <Badge variant="secondary" className="text-xs">
            {searchResults.length} seção(ões)
          </Badge>
        </div>
      )}

      {/* Search Results by Section */}
      {searchTerm && searchResults.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.sectionId}
              onClick={() => scrollToSection(result.sectionId)}
              className="flex items-center justify-between w-full p-2 bg-secondary/50 rounded-md hover:bg-secondary transition-colors text-left"
              data-testid={`search-result-${result.sectionId}`}
            >
              <span className="text-sm truncate">{result.sectionTitle}</span>
              <Badge variant="outline" className="text-xs ml-2">
                {result.matchCount}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && searchResults.length === 0 && searchTerm.length >= 2 && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Nenhum resultado encontrado para "{searchTerm}"
        </div>
      )}
    </div>
  );
}
