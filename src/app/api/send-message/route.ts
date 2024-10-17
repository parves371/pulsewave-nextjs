import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    // Resolve the query to get the actual user document
    const foundByUsername = await UserModel.findOne({ username }).exec();

    if (!foundByUsername) {
      return (
        Response.json({ success: false, message: "User not found" }),
        {
          status: 404,
        }
      );
    }

    // Check if the user is accepting messages
    if (!foundByUsername.isAcceptingMessages) {
      return (
        Response.json({
          success: false,
          message: "User not accepting messages",
        }),
        { status: 403 }
      );
    }

    // Create the new message
    const newMessage = {
      content,
      createdAt: new Date(),
    };

    // Push the message to the user's messages array
    foundByUsername.messages.push(newMessage as Message);
    await foundByUsername.save();

    return new Response(
      JSON.stringify({ message: "Message sent successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.log("Error sending message", error);

    return (
      Response.json({ message: "Error sending message" }),
      {
        status: 500,
      }
    );
  }
}
