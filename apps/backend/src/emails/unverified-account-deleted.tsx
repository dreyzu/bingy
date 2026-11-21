import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Text,
} from "@react-email/components";
import type React from "react";

interface UnverifiedAccountDeletedEmailProps {
	userName?: string;
	/** Days an account can stay unverified before it's deleted. */
	days?: number;
	logoUrl?: string;
}

const main = {
	color: "#212121",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	padding: "20px",
	margin: "0 auto",
};

const hr = {
	borderColor: "#cccccc",
	margin: "8px 0",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
};

const UnverifiedAccountDeletedEmail: React.FC<
	UnverifiedAccountDeletedEmailProps
> = ({ userName, days = 30, logoUrl }) => {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Preview>Your Bingy account has been deleted</Preview>
				<Container style={container}>
					<Img src={logoUrl || "/static/bingy-icon_text.png"} alt="Bingy" />
					<br />
					<Hr style={hr} />
					<Text style={paragraph}>{userName ? `Hi ${userName},` : `Hi,`}</Text>
					<Text style={paragraph}>
						Your Bingy account has been deleted because its email address wasn't
						verified within {days} days of signing up. All the data linked to
						the account has been removed from our systems.
					</Text>
					<Text style={paragraph}>
						If you'd like to use Bingy, you're welcome to create a new account
						at any time.
					</Text>
					<Text style={paragraph}>
						Best regards,
						<br />
						The Bingy team
					</Text>
					<Hr style={hr} />
				</Container>
			</Body>
		</Html>
	);
};

export default UnverifiedAccountDeletedEmail;
