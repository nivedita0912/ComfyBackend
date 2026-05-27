import jwt from "jsonwebtoken";

// ENV VARIABLE

const JWT_SECRET =
   process.env.JWT_SECRET as string;

if (!JWT_SECRET) {

   throw new Error(
      "JWT_SECRET missing in .env.local"
   );
}

// TOKEN PAYLOAD TYPE

export interface TokenPayload {
   id: string;
   email: string;
}

// GENERATE TOKEN

export function generateToken({
   id,
   email,
   
}: TokenPayload): string {

   return jwt.sign(
      {
         id,
         email,
   
      },
      JWT_SECRET,
      {
         expiresIn: "7d",
      }
   );
}

// VERIFY TOKEN

export function verifyToken(
   token: string
): TokenPayload {

   return jwt.verify(
      token,
      JWT_SECRET
   ) as TokenPayload;
}