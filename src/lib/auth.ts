import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import * as schema from "../db/schema/auth";

if (!process.env.BETTER_AUTH_SECRET) {
        throw new Error("BETTER_AUTH_SECRET is not defined");
    }
if (!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined");
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.FRONTEND_URL],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword : {
        enabled : true,
    },
    user:{
        additionalFields: {
            role: {
                type: "string", required: true , default: "student" , input : true,
            },
            imageCldPubId: {
                type: "string", required: false, input : true,
            },
        }
    }
});