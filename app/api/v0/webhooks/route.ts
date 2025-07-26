import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "v0 webhook endpoint is running",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log("Webhook received");
    console.log(payload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 