"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "@/redux/slices/postSlice";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import api from "@/lib/axios";

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [followStatus, setFollowStatus] = useState({});
  const [likeInfo, setLikeInfo] = useState({});
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const { posts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    if (!token) {
      router.push("/");
    } else {
      const fetchData = async () => {
        try {
          await dispatch(fetchPosts());

          const followRes = await api.get(`/users/followers-following`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFollowersList(followRes.data.followers || []);
          setFollowingList(followRes.data.following || []);

          const followingIds = new Set(
            followRes.data.following?.map((u) => u.id) || []
          );

          const followData = {};
          const likeData = {};

          for (const post of posts) {
            if (user?.id !== post.user_id) {
              followData[post.user_id] = followingIds.has(post.user_id);
            }

            const res2 = await api.get(`/posts/${post.id}/like-info`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            likeData[post.id] = res2.data;
          }

          setFollowStatus(followData);
          setLikeInfo(likeData);
        } catch (err) {
          toast.error("Failed to load data");
          console.error(err);
        }
      };

      fetchData();
    }
  }, [token, dispatch, user?.id, posts.length]);

  const handleFollow = async (userId) => {
    try {
      await api.post(`/users/${userId}/follow`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Followed successfully!");

      const followRes = await api.get(`/users/followers-following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFollowersList(followRes.data.followers || []);
      setFollowingList(followRes.data.following || []);

      const updatedFollowStatus = {};
      const newFollowingIds = new Set(
        followRes.data.following?.map((u) => u.id) || []
      );

      posts.forEach((post) => {
        if (post.user_id !== user.id) {
          updatedFollowStatus[post.user_id] = newFollowingIds.has(post.user_id);
        }
      });

      setFollowStatus(updatedFollowStatus);
    } catch (err) {
      toast.error("Failed to follow");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.get(`/posts/${postId}/like-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLikeInfo((prev) => ({
        ...prev,
        [postId]: res.data,
      }));
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  if (loading) return <Loader text="Loading posts..." />;
  if (error) {
    toast.error(error);
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          📰 Your Feed
        </h1>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">
                    @{post.username}
                  </div>
                </div>
                {user?.id !== post.user_id && (
                  <button
                    className="text-sm text-blue-600 font-medium hover:underline cursor-pointer"
                    onClick={() => handleFollow(post.user_id)}
                  >
                    {followStatus[post.user_id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <p className="text-gray-700 mb-4 text-sm whitespace-pre-line">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {likeInfo[post.id]?.likedBy?.length ?? 0}{" "}
                  {likeInfo[post.id]?.likedBy?.length === 1 ? "like" : "likes"}
                </span>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`font-medium cursor-pointer ${
                    likeInfo[post.id]?.isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-blue-500 hover:underline"
                  }`}
                >
                  {likeInfo[post.id]?.isLiked ? "❤️ Liked" : "Like"}
                </button>
              </div>
            </div>
          ))
        )}

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            <strong>Followers:</strong>{" "}
            {followersList.length > 0
              ? followersList.map((f) => f.username).join(", ")
              : "None"}
          </p>
          <p>
            <strong>Following:</strong>{" "}
            {followingList.length > 0
              ? followingList.map((f) => f.username).join(", ")
              : "None"}
          </p>
        </div>
      </div>
    </>
  );
}
