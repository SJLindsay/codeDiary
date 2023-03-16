import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../server/db/client";
import { authOptions } from "./auth/[...nextauth]";

function titleFromCode(code) {
  // console.log(code);
  return code.trim().split("\n")[0].replace("// ", "");
}

export default async function handler(req, res) {
  const { method } = req;
  const session = await unstable_getServerSession(req, res, authOptions);


  switch (method) {
    case "GET":
      let posts = await prisma.post.findMany({
        include: {
          user: true,
          likes: {
            select: {
              user: true,
            },
          },
        },
      });
      if (session) {
        posts = posts.map((post) => ({
          ...post,
          liked: post.likes.some(
            (like) => like.user.email === session.user.email
          ),
        }));
        // console.log("x", posts, session.user);
      }
      res.status(200).json(posts);
      break;

    case "POST":
      const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
     
      if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // console.log(prismaUser);
      if (!prismaUser) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // get the title and content from the request body
      const { code, language } = req.body;

      const title = titleFromCode(code);
      // use prisma to create a new post using that data
      const post = await prisma.post.create({
        data: {
          code,
          language,
          userId: prismaUser.id,
          title,
        },
        include: {
          user: true,
        },
      });
      // send the post object back to the client
      res.status(201).json(post);
      break;

    case "PUT":

      // const id = req.body.id;
      if (req.body.totalComments) {
        const { postId, totalComments } = req.body;
        console.log("body", req.body);
        const countComments = await prisma.post.update({
          where: { id: +postId },
          data: {
            totalComments: totalComments,
          },
        });
        res.status(201).json(countComments);
        return;
      }

      if (req.body.totalLikes !== undefined) {
        const { postId, totalLikes } = req.body;
        const countLikes = await prisma.post.update({
          where: { id: +postId },
          data: {
            totalLikes: totalLikes,
          },
        });
        res.status(201).json(countLikes);
        return;
      }

    // break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
