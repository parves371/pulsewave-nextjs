import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { verifySchema } from "@/schemas/verifySchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

const VerifyEmailQuerySchema = z.object({
  token: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, token } = await request.json();

    const usernameParamsResult = UsernameQuerySchema.safeParse({ username });
    if (!usernameParamsResult.success) {
      const usernameErrors =
        usernameParamsResult.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors?.join(", ")
              : "invalid query paramaitars",
        },
        { status: 400 }
      );
    }

    const emailParamsResult = VerifyEmailQuerySchema.safeParse({ token });
    if (!emailParamsResult.success) {
      const emailErrors = emailParamsResult.error.format().token?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            emailErrors?.length > 0
              ? emailErrors?.join(", ")
              : "invalid query paramaitars",
        },
        { status: 400 }
      );
    }

    const existingVerifyUser = await UserModel.findOne({ username });

    if (!existingVerifyUser) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 400 }
      );
    }

    const isCodeValid = existingVerifyUser.verifycode === token;
    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "invalid verification code",
        },
        { status: 400 }
      );
    }
    // check if code expired
    const isCodeExpired =
      new Date(existingVerifyUser.verifycodeExpires) > new Date();
    // check if code expired
    if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "verification code expired",
        },
        { status: 400 }
      );
    }
    // update user verified to true
    existingVerifyUser.isVerified = true;
    await existingVerifyUser.save();

    return Response.json(
      {
        success: true,
        message: "user verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: "error user verification",
      },
      { status: 500 }
    );
  }
}
