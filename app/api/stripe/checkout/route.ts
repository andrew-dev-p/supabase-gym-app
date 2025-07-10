import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const PRICE_IDS: Record<string, string> = {
  Monthly: "price_1...",
  Quarterly: "price_2...",
  "Half-Yearly": "price_3...",
  Yearly: "price_4...",
};

export async function POST(req: NextRequest) {
  const { plan, userId } = await req.json();
  if (!plan || !userId) {
    return NextResponse.json({ error: "Missing plan or userId" }, { status: 400 });
  }
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=1`,
      client_reference_id: userId,
      metadata: { plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 