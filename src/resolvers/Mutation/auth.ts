import bcrypt from "bcrypt";
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
export const authResolver = {
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
};
