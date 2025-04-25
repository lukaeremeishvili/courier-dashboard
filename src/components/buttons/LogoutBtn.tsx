"use client";
import { useAuth } from "@/hooks/useAuth";

const LogoutButton = () => {
  const { handleLogout } = useAuth();

  const handleClick = async () => {
    await handleLogout();
    window.location.reload(); 
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 cursor-pointer bg-blue-400 text-white rounded-md hover:bg-blue-300"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
