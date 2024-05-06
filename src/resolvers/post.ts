import { userLoader } from "../dataLoders/userLoader";

export const Post = {
  author: async (parent: any, args: any, { prisma, userInfo }: any) => {
    console.log("User: ", parent.authorId);
    return userLoader.load(parent.authorId);
  },
};
