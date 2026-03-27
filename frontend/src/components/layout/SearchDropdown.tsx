"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { productService, AutocompleteItem } from "@/services/product.service";

const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY = 8;
const DEBOUNCE_MS = 300;

/** Safe keyword highlighting — no dangerouslySetInnerHTML */
function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="search-highlight" style={{ backgroundColor: "transparent", color: "var(--brand)", fontWeight: "bold" }}>{part}</mark>
    ) : (
      part
    )
  );
}

/** LocalStorage search history with deduplication + limit */
function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addSearchHistory(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  let history = getSearchHistory();
  history = [query.trim(), ...history.filter((item) => item !== query.trim())].slice(0, MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function removeSearchHistoryItem(query: string) {
  if (typeof window === "undefined") return;
  let history = getSearchHistory();
  history = history.filter((item) => item !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function clearSearchHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

export function SearchDropdown() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteItem[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const controllerRef = useRef<AbortController>(undefined);

  // Load history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Fetch autocomplete with abort controller */
  const fetchAutocomplete = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    // Abort previous request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    try {
      const items = await productService.autocomplete(q.trim(), controller.signal);
      if (!controller.signal.aborted) {
        setResults(items);

        // If no results, fetch suggestions
        if (items.length === 0) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"}/products/search?q=${encodeURIComponent(q.trim())}&limit=8`,
              { signal: controller.signal, credentials: "include" }
            );
            const data = await res.json();
            if (!controller.signal.aborted) {
              setSuggestions(data.data?.suggestions || []);
            }
          } catch {
            // ignore
          }
        } else {
          setSuggestions([]);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  /** Handle input change with debounce */
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);

    clearTimeout(timerRef.current);
    if (value.trim().length > 0) {
      timerRef.current = setTimeout(() => {
        fetchAutocomplete(value);
      }, DEBOUNCE_MS);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  };

  /** Navigate to full search page */
  const doSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    addSearchHistory(searchQuery.trim());
    setHistory(getSearchHistory());
    setIsOpen(false);
    router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  /** Navigate to product detail */
  const goToProduct = (productId: string) => {
    if (query.trim()) {
      addSearchHistory(query.trim());
      setHistory(getSearchHistory());
    }
    setIsOpen(false);
    router.push(`/products/${productId}`);
  };

  /** Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length > 0 ? results.length : 0;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        goToProduct(results[selectedIndex].id);
      } else {
        doSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showHistory = isOpen && query.trim() === "" && history.length > 0;
  const showResults = isOpen && query.trim() !== "" && results.length > 0;
  const showNoResults = isOpen && query.trim() !== "" && results.length === 0 && !isLoading;
  const showDropdown = showHistory || showResults || showNoResults;

  return (
    <div className="search-dropdown-wrapper">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="search-dropdown__icon"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm laptop, điện thoại, tai nghe..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          setIsOpen(true);
          setHistory(getSearchHistory());
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        id="global-search-input"
      />

      {isLoading && query.trim() && (
        <div className="search-dropdown__spinner" />
      )}

      {showDropdown && (
        <div className="search-dropdown" ref={dropdownRef}>
          {/* Search History */}
          {showHistory && (
            <div className="search-dropdown__section">
              <div className="search-dropdown__section-header">
                <span>🕐 Lịch sử tìm kiếm</span>
                <button
                  className="search-dropdown__clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSearchHistory();
                    setHistory([]);
                  }}
                >
                  Xóa tất cả
                </button>
              </div>
              {history.map((item, i) => (
                <div
                  key={`history-${i}`}
                  className="search-dropdown__history-item"
                  onClick={() => {
                    setQuery(item);
                    doSearch(item);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{item}</span>
                  <button
                    className="search-dropdown__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearchHistoryItem(item);
                      setHistory(getSearchHistory());
                    }}
                    title="Xóa"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Autocomplete Results */}
          {showResults && (
            <div className="search-dropdown__section">
              {results.map((item, i) => (
                <div
                  key={item.id}
                  className={`search-dropdown__result-item ${i === selectedIndex ? "search-dropdown__result-item--active" : ""}`}
                  onClick={() => goToProduct(item.id)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=80&q=60"
                    }
                    alt={item.name}
                    className="search-dropdown__thumb"
                  />
                  <div className="search-dropdown__info">
                    <div className="search-dropdown__name">
                      {highlightText(item.name, query.trim())}
                    </div>
                    <div className="search-dropdown__price">
                      {item.price.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                </div>
              ))}
              <div
                className="search-dropdown__view-all"
                onClick={() => doSearch(query)}
              >
                Xem tất cả kết quả cho &ldquo;{query.trim()}&rdquo; →
              </div>
            </div>
          )}

          {/* No Results + Suggestions */}
          {showNoResults && (
            <div className="search-dropdown__section">
              <div className="search-dropdown__no-results">
                <p>Không tìm thấy sản phẩm cho &ldquo;{query.trim()}&rdquo;</p>
              </div>
              {suggestions.length > 0 && (
                <>
                  <div className="search-dropdown__section-header">
                    <span>💡 Có thể bạn muốn tìm</span>
                  </div>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="search-dropdown__result-item"
                      onClick={() => goToProduct(item.id)}
                    >
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=80&q=60"
                        }
                        alt={item.name}
                        className="search-dropdown__thumb"
                      />
                      <div className="search-dropdown__info">
                        <div className="search-dropdown__name">{item.name}</div>
                        <div className="search-dropdown__price">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
