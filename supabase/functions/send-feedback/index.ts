
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  type: string;
  rating: number;
  subject: string;
  message: string;
  timestamp: string;
  userAgent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedbackData: FeedbackRequest = await req.json();

    console.log('Received feedback:', feedbackData);

    const emailResponse = await resend.emails.send({
      from: "NarrArtive Feedback <onboarding@resend.dev>",
      to: ["maaz.rizwan2002@gmail.com"],
      subject: `New Feedback: ${feedbackData.subject}`,
      html: `
        <h2>New Feedback Received</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Feedback Details</h3>
          <p><strong>Type:</strong> ${feedbackData.type}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(feedbackData.rating)} (${feedbackData.rating}/5)</p>
          <p><strong>Subject:</strong> ${feedbackData.subject}</p>
          <p><strong>Submitted:</strong> ${new Date(feedbackData.timestamp).toLocaleString()}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3>Message</h3>
          <p style="white-space: pre-wrap;">${feedbackData.message}</p>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Technical Details</h4>
          <p><strong>User Agent:</strong> ${feedbackData.userAgent}</p>
          <p><strong>Timestamp:</strong> ${feedbackData.timestamp}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This feedback was submitted through the NarrArtive feedback form.
        </p>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
