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

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
