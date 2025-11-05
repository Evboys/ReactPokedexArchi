import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored) setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="ReactPokedexArchi/" element={<Search />} />
          <Route path="ReactPokedexArchi/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  );
}
