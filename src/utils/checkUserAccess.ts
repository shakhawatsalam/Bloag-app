export const checkUserAccess = async (
  prisma: any,
  userId: any,
  postId: any
) => {
  console.log(userId, postId);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      userError: "User Not Found",
      post: null,
    };
  }

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    return {
      userError: "Post Not Found",
      post: null,
    };
  }

  if (post.authorId !== user.id) {
    return {
      userError: "Post not owned by user",
      post: null,
    };
  }
};
