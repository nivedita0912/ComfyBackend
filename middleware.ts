import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
   if (request.method === "OPTIONS") {
      return new NextResponse(null, {
         status: 204,
         headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",  
         },
      });
   }

   const response = NextResponse.next();

   response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
   response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
   response.headers.set("Access-Control-Allow-Credentials", "true");

   return response;
}

export const config = {
   matcher: "/:path*",
};