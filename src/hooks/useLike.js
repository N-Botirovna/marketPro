"use client";
import { useState } from "react";
import { likeBook } from "@/services/books";
import { addLike, removeLike, isLiked as checkIsLiked } from "@/utils/likeStorage";

export function useLike(bookId, bookIsLiked, bookLikeCount) {
  const [liked, setLiked] = useState(
    () => checkIsLiked(bookId) || bookIsLiked === true
  );
  const [count, setCount] = useState(bookLikeCount || 0);
  const [liking, setLiking] = useState(false);

  const sync = (id, isLikedFlag, likeCount) => {
    setLiked(checkIsLiked(id) || isLikedFlag === true);
    setCount(likeCount || 0);
  };

  const toggle = async (id) => {
    if (liking || !id) return null;

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setCount(nextCount);

    try {
      setLiking(true);
      const response = await likeBook(id);

      if (response.success) {
        const finalCount = response.is_liked ? nextCount : Math.max(0, nextCount);
        setLiked(response.is_liked);
        setCount(finalCount);

        if (response.is_liked) addLike(id);
        else removeLike(id);

        window.dispatchEvent(new Event(response.is_liked ? "bookLiked" : "bookUnliked"));
        return { isLiked: response.is_liked, count: finalCount };
      }
      return null;
    } catch (err) {
      setLiked(prevLiked);
      setCount(prevCount);
      throw err;
    } finally {
      setLiking(false);
    }
  };

  return { liked, count, liking, toggle, sync };
}
