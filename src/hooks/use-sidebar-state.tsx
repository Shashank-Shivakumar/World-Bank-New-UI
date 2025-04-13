
import { useState, useEffect } from "react";

export function useSidebarState() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState) {
      setIsExpanded(savedState === "expanded");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebar-state", newState ? "expanded" : "collapsed");
  };

  return {
    isExpanded,
    toggleSidebar
  };
}
