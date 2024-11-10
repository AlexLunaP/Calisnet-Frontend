import React, { useState, useCallback } from "react";
import { Input, Box, List, ListItem } from "@chakra-ui/react";
import debounce from "lodash.debounce";
interface LocationAutocompleteProps {
  onSelect: (suggestion: any) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  interface Suggestion {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
  }

  const fetchSuggestions = async (value: string) => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&q=${value}&format=json`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Suggestion[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(async (value: string) => {
      await fetchSuggestions(value);
    }, 2000),
    [fetchSuggestions]
  );

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setQuery(value);

    if (value.length > 5) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.display_name);
    setSuggestions([]);
    onSelect(suggestion);
  };

  return (
    <Box>
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder="Enter competition location"
      />
      {suggestions.length > 0 && (
        <List bg="white" border="1px solid #ccc" mt={2} borderRadius="md">
          {suggestions.map((suggestion) => (
            <ListItem
              key={suggestion.place_id}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default LocationAutocomplete;
