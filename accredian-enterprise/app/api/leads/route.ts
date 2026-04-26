import { NextResponse } from "next/server";
import { z } from "zod";

import { addLead } from "@/lib/leadStore";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  teamSize: z.string().min(1),
  message: z.string().min(10)
});

export const POST = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required fields."
        },
        { status: 400 }
      );
    }

    addLead(parsed.data);

    return NextResponse.json({
      success: true,
      message: "We'll be in touch!"
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process your request right now."
      },
      { status: 500 }
    );
  }
};
