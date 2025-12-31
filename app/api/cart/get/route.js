import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        await connectDB()
        const user = await User.findById(userId)
        // Fallback to empty object if user or cartItems is undefined
        const cartItems = (user && user.cartItems) ? user.cartItems : {};
        return NextResponse.json({success : true, cartItems})
    } catch (error) {
        return NextResponse.json({success:false, message: error.message})
    }
}