import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section className="p-5 bg-gray-100">
        <Row>
          <Heading as="h2" className="text-xl text-gray-800">
            Hello {username},
          </Heading>
        </Row>
        <Row>
          <Text className="text-base text-gray-600">
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text className="text-lg font-bold text-black">{otp}</Text>
        </Row>
        <Row>
          <Text className="text-base text-gray-600">
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
        <Row>
          <Button
            href={`http://localhost:3000/verify/${username}`}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Verify Here
          </Button>
        </Row>
      </Section>
    </Html>
  );
}
