import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NewPostForm from "../components/NewPostForm";
import { useSession, signIn, signOut } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Profile({ user }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async ({ code, language }) => {
    const { data } = await axios.post("/api/posts", { code, language });
    // console.log(data);
  };

  return (
    <>
      <Head>
        <title>Create a Snippet</title>
      </Head>
      <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 max-w-5xl mx-auto px-12 my-6">
        <h1 className="font-medium leading-tight text-5xl mt-0 mb-2 text-indigo-300">
          Create a Snippet
        </h1>
        <div className="mt-6">
          <NewPostForm className="max-w-2xl mx-auto" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    //redirect to login page
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
}
