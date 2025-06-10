"use client";

import { useState, useRef, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { AccountSettingsModal } from "./account-settings-modal";
import { usePathname } from "next/navigation"; // Import usePathname

export function TeachHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [pathname, setPathname] = useState<string | null>(null); // State to store the pathname
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPathname(window.location.pathname); // Update pathname once the component is mounted
  }, []); // Empty dependency array to run only once on mount

  // Extract the classId from the pathname, assuming it's in the format /teach/clases/[classId]
  const classId = pathname?.split("/").pop() || null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountSettings = () => {
    setIsDropdownOpen(false);
    setIsAccountModalOpen(true);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);

    // Eliminar cookies de auth
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "user_id=; path=/; max-age=0";

    // Redirigir al home o login
    window.location.href = "/";
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {/* Show class name only if we are not in the "/teach" path */}
            {pathname !== "/teach" && classId && (
              <h1 className="text-xl font-semibold text-gray-900">
                Clase: {classId}
              </h1>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleAccountSettings}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Configuración de la cuenta
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
}
