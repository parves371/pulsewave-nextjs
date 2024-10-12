import { ApiResponse } from "@/types/apiResponse";
import VerificationEmail from "../../emails/verificationEmails";
import { resend } from "@/lib/resend";

export async function sendVerificationEmail(
  email: string,
  username: string,
  varificationcode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "you@example.com",
      to: email,
      subject: "pulsewave | Verification Code",
      react: VerificationEmail({ username, otp: varificationcode }),
    });

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}
