import { initTRPC } from '@trpc/server';
import { transformer } from '../shared/transformer';
import { Context } from './context';
import { context, reddit } from '@devvit/web/server';
import { countDecrement, countGet, countIncrement } from './core/count';
import { z } from 'zod';
import { generateRedditReply, postReply } from './core/ai/reddit-replier';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = t.router({
  init: t.router({
    get: publicProcedure.query(async () => {
      const [count, username] = await Promise.all([
        countGet(),
        reddit.getCurrentUsername(),
      ]);

      return {
        count,
        postId: context.postId,
        username,
      };
    }),
  }),
  counter: t.router({
    increment: publicProcedure
      .input(z.number().optional())
      .mutation(async ({ input }) => {
        const { postId } = context;
        return {
          count: await countIncrement(input),
          postId,
          type: 'increment',
        };
      }),
    decrement: publicProcedure
      .input(z.number().optional())
      .mutation(async ({ input }) => {
        const { postId } = context;
        return {
          count: await countDecrement(input),
          postId,
          type: 'decrement',
        };
      }),
    get: publicProcedure.query(async () => {
      return await countGet();
    }),
  }),
  ai: t.router({
    generateReply: publicProcedure
      .input(z.object({
        postTitle: z.string(),
        postBody: z.string(),
        subreddit: z.string(),
        productContext: z.object({
          name: z.string(),
          description: z.string(),
          url: z.string(),
          keywords: z.array(z.string()),
        })
      }))
      .mutation(async ({ input }) => {
        return await generateRedditReply(
          input.postTitle,
          input.postBody,
          input.subreddit,
          input.productContext
        );
      }),
    submitReply: publicProcedure
      .input(z.object({
        postId: z.string(),
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await postReply(input.postId, input.text);
      }),
  }),
});

export type AppRouter = typeof appRouter;
