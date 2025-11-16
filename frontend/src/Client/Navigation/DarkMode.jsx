import React, { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const DarkMode = () => {
  const [enabled, setEnabled] = useState(
    (localStorage.getItem("theme") === "dark") ? true : false

  );

  // 🌓 Exemple : changer le thème du body
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme','dark')
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme','light')
    }
  }, [enabled]);
  return (
    <div className="py-5 flex flex-col items-start gap-3">
    <Switch.Group>
      <div className="flex items-center gap-3">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
            enabled ? " bg-gradient-to-r from-[#2563EB] to-[#313f58]" : "bg-gray-300"
          }`}
        >
         <span
              className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform duration-300 ${
                enabled ? "translate-x-7" : "translate-x-1"
              }`}
            >
              {enabled ? (
                <MoonIcon className="h-4 w-4 text-accent" />
              ) : (
                <SunIcon className="h-4 w-4 text-accent" />
              )}
            </span>
        </Switch>
      </div>
      </Switch.Group>
      </div>
  );
};

export default DarkMode;
