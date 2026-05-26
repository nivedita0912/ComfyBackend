import User from "@/model/user";

import {
   NextRequest,
   NextResponse,
} from "next/server";

import {
   connectDB,
} from "@/lib/connectToDB";

export async function GET(
   req: NextRequest
) {

   try {

      // CONNECT DATABASE

      await connectDB();

      // GET ALL USERS

      const users =
         await User.find();

      // RESPONSE

      return NextResponse.json(
         {
            success: true,
            users,
         },
         {
            status: 200,
         }
      );

   } catch (e) {

      console.log(e); 

      return NextResponse.json(
         {
            success: false,
            message:
               "Something went wrong",
         },
         {
            status: 500,
         }
      );
   }
}