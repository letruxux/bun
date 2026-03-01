"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useState, useEffect, type ChangeEvent } from "react";
import { InputGroupAddon } from "./ui/input-group";
import { getAutocompleteSuggestions, type AutocompleteItem } from "@/lib/autocomplete";
import { useMainStore } from "@/store/main-store";
import { ImageWeserv } from "@letruxux/weserv-js";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        const results = await getAutocompleteSuggestions(query);
        setItems(results);
        setLoading(false);
      } else {
        setItems([]);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const { currentSearchEngine, cycleSearchEngine } = useMainStore();
  console.log(currentSearchEngine);

  const handleSelect = (value: string | null) => {
    if (!value) return;
    window.open(
      currentSearchEngine.urlFormatter.replace("{{QUERY}}", encodeURIComponent(value)),
      "_blank",
    );
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Combobox open={open} onOpenChange={setOpen} onValueChange={handleSelect}>
        <div className="size-4"></div>
        <ComboboxInput
          showTrigger={false}
          placeholder={`search on ${currentSearchEngine.name.toLowerCase()}!`}
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSelect(query);
            console.log(e.key);
            if (e.key === "Tab") {
              cycleSearchEngine();
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true);
          }}
          className="max-w-xl w-full h-12"
        >
          <InputGroupAddon>
            <img
              src={new ImageWeserv(currentSearchEngine.iconUrl).toString()}
              className="h-4 w-4 text-muted-foreground"
            />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent className="bg-transparent outline-none -translate-x-5">
          <ComboboxList className="max-w-xl w-full">
            {loading ? (
              <ComboboxItem disabled>loading...</ComboboxItem>
            ) : (
              items.map((item) => (
                <ComboboxItem key={item.text} value={item.text}>
                  <div className="flex items-center gap-2 w-full h-6 pl-1">
                    {item.image && (
                      <img
                        className="h-6 w-6 rounded-full"
                        src={item.image}
                        alt={item.text}
                        title={item.text}
                      />
                    )}
                    <span className="font-bold">{item.text}</span>
                    {item.desc && (
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    )}
                  </div>
                </ComboboxItem>
              ))
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
