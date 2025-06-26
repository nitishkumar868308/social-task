"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchPosts } from "@/redux/slices/postSlice";

export default function CreatePostModal({ closeModal }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Post content is required");
    setLoading(true);

    try {
      await api.post(
        "/posts",
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Post created!");
      setContent("");
      closeModal();
      dispatch(fetchPosts());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-400/20">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg relative">
        <button
          onClick={closeModal}
          className="absolute top-2 right-3 text-xl font-bold text-gray-400 hover:text-black"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={5}
            placeholder="Write something..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
