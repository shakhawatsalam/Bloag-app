import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
// * ---------- Imports ------------ // *

// * Prisma
const prisma = new PrismaClient();

// * Interfaces
interface Context {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
}
const main = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async (): Promise<Context> => {
      return {
        prisma,
      };
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

main();
