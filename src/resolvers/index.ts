import { PrismaClient } from "@prisma/client";
import { createLanguageService } from "typescript";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { jwtHelper } from "../utils/jwtHelper";
import config from "../config";

// * Prisma
const prisma = new PrismaClient();

interface UserInfo {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export const resolvers = {
  Query: {
    users: async (parent: any, args: any, contex: any) => {
      return await prisma.user.findMany({});
    },
  },
  Mutation: {
    signup: async (parent: any, args: UserInfo, contex: any) => {
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
      const token = await jwtHelper(
        {
          userId: newUser.id,
        },
        config.jwt.secret as Secret
      );
      return {
        userError: null,
        token,
      };
    },
    singin: async (parent: any, args: UserInfo, contex: any) => {
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
      const token = await jwtHelper(
        {
          userId: user.id,
        },
        config.jwt.secret as Secret
      );
      return {
        userError: null,
        token,
      };
    },
  },
};
