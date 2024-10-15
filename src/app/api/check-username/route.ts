import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    console.log(result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

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

    const { username } = result.data;

    const existingVerifyUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifyUser) {
      return Response.json(
        {
          success: false,
          message: "username already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "username available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("username checking error", error);
    return Response.json(
      {
        success: false,
        message: "username checking error",
      },
      { status: 500 }
    );
  }
}
