import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendverificationEmail";

export async function POST(request: Request) {
  await dbConnect(); // Establish DB connection

  try {
    const { email, password, username } = await request.json(); // Parse request body

    // Check if the username is already verified and taken
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifycode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "username already exists by email" },
          { status: 400 }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hasedPassword;
        existingUserByEmail.verifycode = verifycode;
        existingUserByEmail.verifycodeExpires = new Date(
          Date.now() + 1000 * 60 * 60 * 24 // 1 day
        );

        await existingUserByEmail.save();
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification code and its expiration date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1); // Code expires in 1 day

      // Create a new user document
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifycode,
        verifyCodeExpires: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save(); // Save user to the database
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifycode
    );

    if (!emailResponse) {
      return Response.json(
        { success: false, message: emailResponse },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "User created successfully. please check your email for verification",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in signup", error);
    return Response.json(
      { success: false, message: "Error in signup" },
      { status: 500 }
    );
  }
}
