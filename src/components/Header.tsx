import { useState, useEffect, useRef } from "react";

type Theme = "light" | "dark" | "system";

interface ZoomPreset {
  label: string;
  value: "auto" | number;
}

interface HeaderProps {
  zoomLabel: string;
  zoomPresets: ZoomPreset[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomPreset: (value: "auto" | number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  filteredNodes: { id: string; title: string }[];
  onNodeClick: (nodeId: string) => void;
  onAddNodeClick: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  gridDensity: number;
  onGridDensityChange: (density: number) => void;
}

const GRID_DENSITY_MIN = 15;
const GRID_DENSITY_MAX = 100;

export default function Header({
  zoomLabel,
  zoomPresets,
  onZoomIn,
  onZoomOut,
  onZoomPreset,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filteredNodes,
  onNodeClick,
  onAddNodeClick,
  showGrid,
  onToggleGrid,
  gridDensity,
  onGridDensityChange,
}: HeaderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "system";
  });
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [gridPopoverOpen, setGridPopoverOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const gridPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setZoomDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!searchQuery) setSearchExpanded(false);
      }
      if (gridPopoverRef.current && !gridPopoverRef.current.contains(e.target as Node)) {
        setGridPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const handleSearchMouseEnter = () => {
    setSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSearchMouseLeave = () => {
    if (!searchQuery) setSearchExpanded(false);
  };

  return (
    <header className="app-header" ref={headerRef}>
      <div className="header-capsule">
        <button className="header-btn" onClick={onZoomOut} title="Zoom Out">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="header-dropdown-container">
          <button
            className="header-btn header-btn-text"
            onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
          >
            {zoomLabel}
            <svg
              className={`header-dropdown-icon ${zoomDropdownOpen ? "open" : ""}`}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {zoomDropdownOpen && (
            <div className="header-dropdown">
              {zoomPresets.map((preset) => (
                <button
                  key={preset.label}
                  className="header-dropdown-item"
                  onClick={() => {
                    onZoomPreset(preset.value);
                    setZoomDropdownOpen(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="header-btn" onClick={onZoomIn} title="Zoom In">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="header-divider" />

        <div
          ref={searchContainerRef}
          className={`header-search ${searchExpanded ? "expanded" : ""}`}
          onMouseEnter={handleSearchMouseEnter}
          onMouseLeave={handleSearchMouseLeave}
        >
          <button className="header-btn" title="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <form onSubmit={onSearchSubmit} className="header-search-form">
            <input
              ref={searchInputRef}
              type="text"
              className="header-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>
          {searchExpanded && searchQuery && filteredNodes.length > 0 && (
            <div className="header-dropdown header-search-results">
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  className="header-dropdown-item"
                  onClick={() => {
                    onNodeClick(node.id);
                    onSearchChange("");
                    setSearchExpanded(false);
                  }}
                >
                  {node.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-divider" />

        <button className="header-btn header-btn-text" onClick={onAddNodeClick} title="Add Node">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span>Add Node</span>
        </button>

        <div className="header-divider" />

        <div
          className="header-grid-group"
          ref={gridPopoverRef}
          onMouseEnter={() => setGridPopoverOpen(true)}
          onMouseLeave={() => setGridPopoverOpen(false)}
        >
          <button
            className="header-btn header-grid-btn"
            onClick={onToggleGrid}
            title={showGrid ? "Hide Grid" : "Show Grid"}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
              <line x1="6" y1="3" x2="6" y2="21" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="18" y1="3" x2="18" y2="21" />
              {!showGrid && <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5" />}
            </svg>
          </button>
          <div className={`header-grid-popover ${gridPopoverOpen ? "visible" : ""}`}>
            <div className="header-grid-popover-row">
              <span className="header-grid-popover-label">Density</span>
              <div className={`header-grid-slider-container ${!showGrid ? "disabled" : ""}`}>
                <input
                  type="range"
                  className="header-grid-slider"
                  min={GRID_DENSITY_MIN}
                  max={GRID_DENSITY_MAX}
                  value={gridDensity}
                  onChange={(e) => onGridDensityChange(Number(e.target.value))}
                  disabled={!showGrid}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="header-divider" />

        <div className="header-theme-group">
          <button
            className={`header-btn header-theme-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
            title="Light Theme"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <button
            className={`header-btn header-theme-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
            title="Dark Theme"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <button
            className={`header-btn header-theme-btn ${theme === "system" ? "active" : ""}`}
            onClick={() => setTheme("system")}
            title="System Theme"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

