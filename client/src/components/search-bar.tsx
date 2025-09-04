import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  "data-testid"?: string;
}

export default function SearchBar({ onSearch, "data-testid": testId }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative" data-testid={testId}>
      <Input
        type="text"
        placeholder="Buscar termos ou seções..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pl-10 focus:ring-2 focus:ring-ring focus:border-ring"
        data-testid="input-search"
      />
      <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
    </div>
  );
}
