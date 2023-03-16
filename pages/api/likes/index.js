import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../../server/db/client";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;

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
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        // res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      // console.log(prismaUser);
      if (!prismaUser) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const isLiked = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: +req.body.postId,
            userId: prismaUser.id,
          },
        },
      });

      if (isLiked) {
        await prisma.like.delete({
          where: {
            postId_userId: {
              postId: +req.body.postId,
              userId: prismaUser.id,
            },
          },
        });
        res.status(200).json({ message: "unliked", liked: false });
        return;
      } else {
        await prisma.like.create({
          data: {
            postId: +req.body.postId,
            userId: prismaUser.id,
          },
        });
        res.status(200).json({ message: "liked", liked: true });
        return;
      }

    case "PUT":

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
      console.log("data", req.body)
      break;
    default:
      res.status(405).end(`Method ${method} Not Allowed`);

    // console.log("zero ", req.query.id)

    // console.log("ok", req.body.postId, prismaUser.id);
  }
}
