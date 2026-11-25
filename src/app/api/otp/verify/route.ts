import { handleOtp } from "@/lib/otp/http";
export const maxDuration = 30;
export async function POST(request: Request) { return handleOtp(request, "verify"); }
