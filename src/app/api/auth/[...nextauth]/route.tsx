// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const runtime = "nodejs"; // required for bcrypt
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
