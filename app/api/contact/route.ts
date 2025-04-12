import { NextResponse } from 'next/server';
import Mailjet from 'node-mailjet';



interface FormData {
    name: string;
    email: string;
    productType: string;
    weight: string;
    message?: string;
    estimatedPrice: number | null;
    estimatedTime: number | null;
}

const mailjet = new Mailjet({
    apiKey: process.env.MJ_API_KEY || '',
    apiSecret: process.env.MJ_API_SECRET || '',
});

const emailTo = process.env.EMAIL_TO;
const emailFrom = process.env.EMAIL_FROM;
const senderName = "frighet.ro Contact";


export async function POST(request: Request) {
    // Basic check for required environment variables
    if (!process.env.MJ_API_KEY || !process.env.MJ_API_SECRET) {
        console.error('Mailjet API Key or Secret is not configured.');
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }
     if (!emailTo || !emailFrom) {
        console.error('Email TO or FROM addresses are not configured in environment variables.');
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    let formData: FormData;

    // 1. Parse the incoming request body
    try {
        formData = await request.json();
    } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    // 2. Basic Validation (add more as needed)
    if (!formData.name || !formData.email || !formData.productType || !formData.weight) {
        return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 3. Prepare Email Content (HTML and Text versions)
    const subject = `Solicitare Liofilizare - ${formData.name}`;

    // HTML Part
    const emailHtmlBody = `
        <h1>Solicitare Nouă frighet.ro</h1>
        <p><strong>Nume:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <hr>
        <p><strong>Tip Produs:</strong> ${formData.productType}</p>
        <p><strong>Greutate Estimată:</strong> ${formData.weight} kg</p>
        <p><strong>Estimare Preliminară Preț:</strong> ${formData.estimatedPrice !== null ? `${formData.estimatedPrice.toFixed(2)} RON` : 'N/A'}</p>
        <p><strong>Estimare Preliminară Timp:</strong> ${formData.estimatedTime !== null ? `${formData.estimatedTime.toFixed(0)} ore` : 'N/A'}</p>
        <hr>
        <p><strong>Mesaj / Detalii:</strong></p>
        <p>${formData.message?.replace(/\n/g, '<br>') || 'Niciun mesaj.'}</p> `;

    // Text Part (for email clients that don't display HTML)
    const emailTextBody = `
        Solicitare Nouă frighet.ro\n
        ------------------------------------\n
        Nume: ${formData.name}\n
        Email: ${formData.email}\n
        ------------------------------------\n
        Tip Produs: ${formData.productType}\n
        Greutate Estimată: ${formData.weight} kg\n
        Estimare Preliminară Preț: ${formData.estimatedPrice !== null ? `${formData.estimatedPrice.toFixed(2)} RON` : 'N/A'}\n
        Estimare Preliminară Timp: ${formData.estimatedTime !== null ? `${formData.estimatedTime.toFixed(0)} ore` : 'N/A'}\n
        ------------------------------------\n
        Mesaj / Detalii:\n
        ${formData.message || 'Niciun mesaj.'}\n
    `;


    // 4. Prepare Mailjet Request Payload
    const mailjetRequestData = {
        Messages: [
            {
                From: {
                    Email: emailFrom,
                    Name: senderName
                },
                To: [
                    {
                        Email: emailTo,
                        // Name: "Recipient Name" // Optional recipient name
                    }
                ],
                Subject: subject,
                TextPart: emailTextBody,
                HTMLPart: emailHtmlBody
            }
        ]
    };

    // 5. Send the email using Mailjet
    try {
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request(mailjetRequestData);

        // Mailjet specific success check (check documentation if needed)
        // Typically checks if response status indicates success
        console.log('Mailjet response:', result.body); // Log the response for debugging

        // Assuming success if no error was thrown and response looks okay
        // You might want to inspect result.body for more specific success indicators
        // e.g., result.body.Messages[0].Status === 'success'

        // Return Success Response
        return NextResponse.json({ message: 'Success! Form submitted.' }, { status: 200 });
    } catch (error: any) { // Catch potential errors from Mailjet request
        console.error('Mailjet error:', error);
        // Mailjet might return error details in error.statusCode or error.response.data
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Failed to send email via Mailjet.';
        return NextResponse.json({ message: 'Failed to send email.', error: errorMessage }, { status: statusCode });
    }
}
