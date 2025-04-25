"use client";

import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out z-10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Back
    </button>
  );
};

export default BackButton;
