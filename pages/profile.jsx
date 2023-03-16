import { useSession, signIn, signOut } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import PostSmall from "../components/PostSmall";
import Comments from "../components/Comment";
import { prisma } from "../server/db/client";

export default function Component({ postObj, commentObj }) {
  const { data: session } = useSession();

  //  do a get request for like all posts, but only show the ones that actually match the session's email or id so its ony the users
  // console.log(postObj);
  // console.log("je", commentObj);

  if (session) {
    const postComponents = postObj.map((post) => {
      console.log("hi", { post });

      return (
        <>
          <div>
            <PostSmall
              user={post.user}
              key={post.id}
              post={post}
              // onComment={handleComments}
              totalLikes={post.totalLikes}
              onLike={() => console.log("liked")}
              href={`/code/${post.id}`}
              className="mb-10"
            />
          </div>
        </>
      );
    });

    const commentComponents = commentObj.map((comment) => {
      console.log("comment", { comment });
      return (
        <>
          <div>
            <Comments user={comment.user} key={comment.id} comment={comment} />
          </div>
        </>
      );
    });
    return (
      <>
        Signed in as {session.user.email} <br />
        <img src={session.user.image} /> <br />
        {session.user.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
        <br />
        <br />
        <div>
          <h1>Posts</h1>
          <br />
          {postComponents}
        </div>
        <br />
        <div>
          <h1>Comments</h1>
          <br />
          {commentComponents}
        </div>
        <br />
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // console.log("1", session)

  if (!session) {
    //redirect to login page
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    // const userObj = JSON.parse(JSON.stringify(user));

    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        comments: true,
        likes: {
          select: {
            user: true,
          },
        },
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    const postObj = JSON.parse(JSON.stringify(posts));
    const commentObj = JSON.parse(JSON.stringify(comments));

    return {
      props: {
        session,
        postObj,
        commentObj,
      },
    };
  }
}
