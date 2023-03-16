import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../../server/db/client";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case "GET":
      const comments = await prisma.comment.findMany({
        where: {
          postId: +req.query.id,
        },
        include: {
          user: true,
        },
      });
      res.status(200).json(comments);
      break;

    case "POST":
      const session = await unstable_getServerSession(req, res, authOptions);

      if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!prismaUser) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { postId, content } = req.body;
      // console.log("Comments Index", req.body);

      const comment = await prisma.comment.create({
        data: {
          userId: prismaUser.id,
          content,
          postId,
        },
        include: {
          user: true,
        },
      });

      // send the post object back to the client
      res.status(201).json(comment);
      break;
      
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
