import NextAuth, { User, NextAuthOptions, Profile, Account } from "next-auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";
import * as jose from "jose";
import {
  CredentialsInterface,
  isCredentials,
  isLoginResponse,
  isJwtPayload,
} from "../../../utils/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth/core/types";

declare module "next-auth" {
  interface User {
    userId: string;
    userEmail: string;
    username: string;
    access_token: string;
  }

  interface Session {
    access_token: string;
    userId: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }

  interface JWT {
    userId: string;
    userEmail: string;
    username: string;
    access_token: string;
  }
}

const options = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userEmail: { label: "Email", type: "email" },
        userPassword: { label: "Password", type: "password" },
      },
      authorize: async (
        credentials: CredentialsInterface | undefined
      ): Promise<User | null> => {
        try {
          if (!isCredentials(credentials)) {
            console.error("next-auth - missing attributes in credentials");
            return null;
          }

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_CALISNET_API_URL}/user/login/`,
            credentials
          );

          if (!isLoginResponse(res.data)) {
            console.error(
              "next-auth - missing attributes in login response",
              JSON.stringify(res.data)
            );
            return null;
          }

          const decodedToken = jwt.verify(
            res.data.access_token,
            process.env.NODE_JWT_SECRET as string
          ) as JwtPayload & {
            sub: {
              userId: string;
              userEmail: string;
              username: string;
            };
          };

          if (!isJwtPayload(decodedToken)) {
            console.error(
              "next-auth - missing attributes in response payload",
              JSON.stringify(decodedToken)
            );
            return null;
          }

          return {
            id: decodedToken.sub.userId,
            userId: decodedToken.sub.userId,
            userEmail: decodedToken.sub.userEmail,
            username: decodedToken.sub.username,
            access_token: res.data.access_token,
          };
        } catch (error) {
          console.error("next-auth - error in authorize", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NODE_JWT_SECRET,
  jwt: {
    secret: process.env.NODE_JWT_SECRET,
    encode: async ({
      secret,
      token,
      maxAge,
    }: {
      secret: string;
      token: any;
      maxAge: number;
    }) => {
      const jwt = await new jose.SignJWT(token)
        .setProtectedHeader({ alg: "HS512" })
        .setExpirationTime(`${maxAge}s`)
        .setIssuedAt() // Ensure 'iat' claim is included
        .sign(new TextEncoder().encode(secret));
      return jwt;
    },

    decode: async ({
      secret,
      token,
      maxAge,
    }: {
      secret: string;
      token: string;
      maxAge: number;
    }) => {
      if (!token) return null;

      const secretKey = new TextEncoder().encode(secret);

      try {
        const { payload } = await jose.jwtVerify(token, secretKey, {
          maxTokenAge: `${maxAge}s`,
          algorithms: ["HS512"],
        });
        return payload;
      } catch (error) {
        console.error("JWT validation failed", error);
        return null;
      }
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      session.access_token = token.access_token as string;
      session.userId = token.userId as string;
      session.user = {
        name: token.username as string,
        email: token.userEmail as string,
        image: null,
      };
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User | null }) {
      if (user) {
        token.userId = user.userId;
        token.userEmail = user.userEmail;
        token.username = user.username;
        token.access_token = user.access_token;
      }
      return Promise.resolve(token);
    },
  },
  debug: process.env.NODE_ENV === "development",
} as unknown as NextAuthOptions;

const authHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);

export default authHandler;
