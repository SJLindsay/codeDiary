// import { prisma } from "../server/db/client";
import PostSmall from "../components/PostSmall";
import Button from "../components/Button";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import useSWR from "swr";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [allPosts, setAllPosts] = useState([]);
  const [isLiked, setIsLiked] = useState();

  // const fetcher = (url) => fetch(url).then((res) => res.json());
  // const { data, error } = useSWR("/api/posts", fetcher);
  // if (error) return <div>failed to load</div>;
  // if (!data) return <div>loading...</div>;

  useEffect(() => {
    axios
      .get("/api/posts")
      .then((res) => {
        // console.log("res.data", res.data);
        setAllPosts(res.data);
      })
      .catch((err) => {
        console.log("error appeared", err);
      });
    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 3000);
  }, []);

  const postComponents = allPosts.map((post, index) => {
    // console.log("hi", post);
    const handleLike = () => {
      axios
      .post(`/api/likes/`, {
        postId: post.id,
        // liked: post.liked,
        // totalLikes: post.totalLikes,
      })
      .then((res) => {
        console.log("this", res.data);
        setIsLiked(res.data.liked);

          if (res.data.liked === true) {
            axios
              .put(`/api/posts/`, {
                postId: post.id,
                totalLikes: post.totalLikes + 1,
              })
              .then((res) => {
                allPosts[index].totalLikes = res.data.totalLikes;
                allPosts[index].liked = true;
                setAllPosts([...allPosts]);
                console.log("plus", res.data);
              })
          }
          if (res.data.liked === false) {
            axios
              .put(`/api/posts/`, {
                totalLikes: post.totalLikes - 1,
                postId: post.id,
              })
              .then((res) => {
                allPosts[index].totalLikes = res.data.totalLikes;
                allPosts[index].liked = false;
                setAllPosts([...allPosts]);
                console.log("minus", post.totalLikes);
              })
          }
        });
    };

    return (
      <PostSmall
        user={post.user}
        key={post.id}
        post={post}
        // onComment={handleComments}
        totalLikes={post.totalLikes}
        onLike={handleLike}
        liked={isLiked}
        href={`/code/${post.id}`}
        className="mb-10"
      />
    );
  });

  return (
    <>
      <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-80">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
              <span className="block">Welcome to</span>
              <span className="block text-indigo-300">Mini Code Diary</span>
            </h1>
          </div>
          <Button onClick={() => router.push("/addPost")}>
            Create A Code Snippet
          </Button>

          {/* <ul className="mt-8">
          {allPosts?.map((post) => (
              <li key={post.id}>
                <PostSmall
                  // Image={}
                  post={post}
                  user={post.user}
                  href={`/code/${post.id}`}
                  className="mb-10"
                  onLike={() => console.log("click")}
                  onComment={() => handleComments(post.id)}
                  onShare={() => console.log("share", post.id)}
                />
              </li>
            ))} */}
          {/* </ul> */}
          <ul className="mt-8">
            <li>{postComponents}</li>
          </ul>
        </div>
      </div>
    </>
  );
}
