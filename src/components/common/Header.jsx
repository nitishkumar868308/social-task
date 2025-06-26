"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { logoutSuccess } from "@/redux/slices/authSlice";
import CreatePostModal from "@/components/posts/CreatePostModal";

export default function Header() {
  const [hasMounted, setHasMounted] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  console.log("user", user);

  const handleLogout = () => {
    logout();
    dispatch(logoutSuccess());
    router.push("/");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm mb-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            👋 Welcome,{" "}
            <span className="text-blue-600">@{user?.username || "Guest"}</span>
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-3 py-1 cursor-pointer rounded-md hover:bg-blue-700 transition"
            >
              ➕ New Post
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {showModal && <CreatePostModal closeModal={() => setShowModal(false)} />}
    </>
  );
}
