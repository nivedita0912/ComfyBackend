import jwt from "jsonwebtoken";
interface DecodeToken {
   id: string,
   email: string,
   role: string,
   iat: number,
}
const JWT_SECRET =
   process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
   throw new Error(
      "JWT_SECRET missing in .env.local"
   );
}
export interface TokenPayload {
   id: string;
   role: string
}
export function generateToken({ id,role }: TokenPayload): string {
   return jwt.sign({ id, role },
      JWT_SECRET,
      {
         expiresIn: "7d",
      }
   );
}
export function verifyToken(
   token: string
): DecodeToken | null {

   try {
      return jwt.verify(
         token,
         JWT_SECRET
      ) as DecodeToken;
   } catch {
      return null;
   }
}