import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Secret } from "jsonwebtoken";
import { jwtHelper } from "../../utils/jwtHelper";
import config from "../../config";
// * ---------- Imports ------------ // *

// * Intarfaces
interface UserInfo {
  name: string;
  email: string;
  password: string;
  bio?: string;
}
export const Mutation = {
  signup: async (parent: any, args: UserInfo, { prisma }: any) => {
    const isExist = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (isExist) {
      return {
        userError: "User is already Exist",
        token: null,
      };
    }
    const hashedPassword = await bcrypt.hash(args.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: args.name,
        email: args.email,
        password: hashedPassword,
      },
    });

    if (args.bio) {
      await prisma.profile.create({
        data: {
          bio: args?.bio,
          userId: newUser?.id,
        },
      });
    }
    const token = await jwtHelper.generateToken(
      {
        userId: newUser.id,
      },
      config.jwt.secret as string
    );
    return {
      userError: null,
      token,
    };
  },
  singin: async (parent: any, args: UserInfo, { prisma }: any) => {
    const user = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (!user) {
      return {
        token: null,
        userError: "User Not Found",
      };
    }
    const correctPass = await bcrypt.compare(args.password, user?.password);

    if (!correctPass) {
      return {
        token: null,
        userError: "Your Password is Incorrect",
      };
    }
    const token = await jwtHelper.generateToken(
      {
        userId: user.id,
      },
      config.jwt.secret as string
    );
    return {
      userError: null,
      token,
    };
  },
  addPost: async (parent: any, args: any, { prisma, userInfo }: any) => {
    if (!userInfo) {
      return {
        userError: "Unauthorize",
        post: null,
      };
    }

    if (!args.title || !args.content) {
      return {
        userError: "Title and Content is required!",
        post: null,
      };
    }

    const newPost = await prisma.post.create({
      data: {
        ...args,
        authorId: userInfo.userId,
      },
    });

    return {
      userError: null,
      post: newPost,
    };
  },
};
