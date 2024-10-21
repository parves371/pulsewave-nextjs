import dbConnect from "@/lib/dbConnect";
import UserModel, { User } from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    // Define the expected structure of request data
    const { username, token }: { username: string; token: string } =
      await request.json();

    // Validate the input (both token and username)
    const emailParamsResult = verifySchema.safeParse(token); // Directly validate the token as a string
    if (!emailParamsResult.success) {
      const emailErrors = emailParamsResult.error.format()?._errors || [];

      return NextResponse.json(
        {
          success: false,
          message:
            emailErrors?.length > 0
              ? emailErrors.join(", ")
              : "Invalid verification code",
        },
        { status: 400 }
      );
    }

    // Find the user by username
    const existingVerifyUser = (await UserModel.findOne({
      username,
    })) as User | null;

    if (!existingVerifyUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    // Verify if the token matches the user's verification code
    const isCodeValid = existingVerifyUser.verifycode === token;
    if (!isCodeValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }

    // Check if the verification code has expired
    const isCodeExpired =
      new Date(existingVerifyUser.verifycodeExpires) < new Date();
    if (isCodeExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code expired",
        },
        { status: 400 }
      );
    }

    // Update the user's verification status
    existingVerifyUser.isVerified = true;
    await existingVerifyUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "User verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during user verification",
      },
      { status: 500 }
    );
  }
}
