import Post from "../../components/Post";
import { prisma } from "../../server/db/client";
import Comments from "../../components/Comments";
import CommentForm from "../../components/CommentForm";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function PostPage({ postObj }) {
  const { data: session } = useSession();

  // console.log("test", postObj)

  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(postObj.totalComments);
  const [totalLikes, setTotalLikes] = useState(postObj.totalLikes);
  const [isLiked, setIsLiked] = useState();

  // const user = session?.user;
  // const [post, setPost] = useState(postObj);

  // console.log("Code[id],#1", postObj);
  // console.log(totalComments);
  // console.log(totalLikes);

  useEffect(() => {
    axios
      .get(`/api/comments/${postObj.id}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => {
        console.log("error appeared", err);
      });
  });

  useEffect(() => {
    setIsLiked(
      postObj.likes.find((like) => like.user.email == session?.user.email)
    );
  }, [session]);

  const handleSubmit = (content) => {
    axios
      .post("/api/comments", {
        content: content,
        postId: postObj.id,
      })
      .then((res) => {
        if (res.data) {
          // console.log("comment added", res.data);

          axios.put("/api/posts", {
            postId: postObj.id,
            totalComments: totalComments + 1,
          });
          setComments([...comments, res.data]);
          setTotalComments(totalComments + 1);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleLike = () => {
    // console.log("handleLikes", session);
    axios.post(`/api/likes/`, { postId: postObj.id }).then((res) => {
      console.log("res", res.data);
      
      setIsLiked(res.data.liked);
      if (res.data.liked === true) {
        axios
          .put(`/api/posts/`, {
            postId: postObj.id,
            totalLikes: totalLikes + 1,
          })
          .then((res) => {
            setTotalLikes(totalLikes + 1);
            console.log("plus", totalLikes);
          });
      }
      if (res.data.liked === false) {
        axios
          .put(`/api/posts/`, {
            postId: postObj.id,
            totalLikes: totalLikes - 1,
          })
          .then((res) => {
            setTotalLikes(totalLikes - 1);
            console.log("minus", totalLikes);
          });
      }
    });
  };


  // console.log("postObj", postObj.likes.find(like => like.user.email == session?.user.email));

  return (
    <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 max-w-5xl mx-auto px-12 my-6">
      <Post
        post={postObj}
        user={postObj.user}
        totalComments={totalComments}
        totalLikes={totalLikes}
        onLike={handleLike}
        //onComment={handleComments}
        liked={isLiked}
      />
      {session && (
        <CommentForm
          user={session.user}
          onSubmit={handleSubmit}
          // textareaRef={}
        />
      )}
      <Comments comments={comments} />
    </div>
  );
}

export async function getStaticProps(context) {
  const post = await prisma.post.findUnique({
    // Returns all user fields
    where: {
      id: +context.params.id,
    },
    include: {
      user: true,
      likes: {
        include: {
          user: true,
        },
      }
    }
  })

  const postObj = JSON.parse(JSON.stringify(post));
  // console.log("POSTOBJ", postObj);
  return {
    props: {
      postObj,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  const posts = await prisma.post.findMany();
  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }));

  return { paths, fallback: "blocking" };
}
