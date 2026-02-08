# Twilio WhatsApp Integration Setup Guide

## Overview

This guide explains how to set up Twilio as the WhatsApp provider for sending lead notifications in the application.

## Prerequisites

1. **Twilio Account**: Create a free account at [twilio.com](https://www.twilio.com)
2. **WhatsApp Business Account**: Set up through Twilio's WhatsApp Business API
3. **Environment Variables**: Configure your Twilio credentials

## Step 1: Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up for a free account
2. Verify your email address
3. Complete the account setup process

## Step 2: Get Your Twilio Credentials

1. Log in to your Twilio Console at [console.twilio.com](https://console.twilio.com)
2. On the dashboard, you'll find:
   - **Account SID**: Your unique account identifier
   - **Auth Token**: Your authentication token (keep this secret!)
3. Copy these values for later use

## Step 3: Set Up WhatsApp Sandbox (Testing)

For development and testing:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the setup wizard to:
   - Confirm your phone number
   - Get a Twilio WhatsApp sandbox number (e.g., +1234567890)
3. Send the activation code to your WhatsApp to enable the sandbox

## Step 4: Set Up WhatsApp Business Account (Production)

For production use:

1. Go to **Messaging** → **WhatsApp** → **Get Started**
2. Complete the WhatsApp Business Account setup:
   - Verify your business information
   - Get approval from WhatsApp
   - Obtain your official WhatsApp Business number
3. This process typically takes 24-48 hours

## Step 5: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### Where to Find These Values:

- **TWILIO_ACCOUNT_SID**: Twilio Console → Account Info
- **TWILIO_AUTH_TOKEN**: Twilio Console → Account Info (keep secret!)
- **TWILIO_WHATSAPP_NUMBER**: 
  - Sandbox: Provided during sandbox setup
  - Production: Your approved WhatsApp Business number

## Step 6: Test the Integration

### Using the Create Lead Page

1. Navigate to `/create-lead` in your application
2. Fill in the lead information
3. Enable "Send WhatsApp notification to sales officer"
4. Enter a phone number in E.164 format (e.g., +1234567890)
5. Click "Create Lead & Notify"

### Testing with Sandbox

For sandbox testing:
1. Send the activation code to your WhatsApp
2. Use your personal phone number in E.164 format
3. Messages will be delivered to your WhatsApp

### Testing with Production

For production:
1. Use the official WhatsApp Business number
2. Recipients must have opted in to receive messages
3. Follow WhatsApp's messaging policies

## Phone Number Format (E.164)

All phone numbers must be in E.164 format:
- Format: `+[country code][number]`
- Examples:
  - USA: `+12025551234`
  - India: `+919876543210`
  - UK: `+441632960000`

## Message Format

The system sends formatted WhatsApp messages with:
- Company name and industry
- Product recommendations
- Lead score and urgency level
- Trust/confidence score
- Link to lead details
- Suggested next action

Example message:
```
🚨 NEW HIGH-INTENT LEAD

Target: Acme Corp
Need: Premium Package (Based on High demand signal)

Urgency: High 🔴
Confidence Score: 75%

Dossier Link: https://yourapp.com/leads/lead-id-123
Next Best Action: Schedule immediate site visit

Industry: Manufacturing
Location: Maharashtra
Contact: contact@acme.com
```

## Pricing

### Twilio WhatsApp Pricing

- **Inbound messages**: $0.0075 per message
- **Outbound messages**: $0.0075 per message
- **Free tier**: 100 messages/month for testing

### Cost Estimation

For 1,000 lead notifications per month:
- Cost: ~$7.50/month
- Free tier covers first 100 messages

## Troubleshooting

### Issue: "Missing Twilio configuration"

**Solution**: Ensure all three environment variables are set:
```bash
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_WHATSAPP_NUMBER
```

### Issue: "Invalid phone number format"

**Solution**: Phone numbers must be in E.164 format:
- ✅ Correct: `+12025551234`
- ❌ Wrong: `2025551234` (missing +)
- ❌ Wrong: `+1 (202) 555-1234` (spaces/formatting)

### Issue: Message not delivered

**Possible causes**:
1. Recipient hasn't opted in (sandbox only)
2. Phone number doesn't have WhatsApp installed
3. Message violates WhatsApp policies
4. Twilio account has insufficient balance

**Solution**:
1. Check Twilio Console → Logs for error details
2. Verify recipient phone number
3. Review WhatsApp messaging policies
4. Check account balance

### Issue: "Twilio API error"

**Solution**:
1. Verify credentials are correct
2. Check Twilio Console for account status
3. Ensure WhatsApp is enabled on your account
4. Check rate limiting (Twilio has request limits)

## Security Best Practices

1. **Never commit credentials**: Use environment variables only
2. **Rotate tokens regularly**: Change auth tokens periodically
3. **Use HTTPS**: All API calls use HTTPS
4. **Rate limiting**: Implement rate limiting to prevent abuse
5. **Validate input**: Phone numbers are validated before sending
6. **Monitor usage**: Check Twilio Console for unusual activity

## Advanced Configuration

### Custom Message Templates

To use WhatsApp message templates (for better delivery):

1. Create templates in Twilio Console
2. Update `whatsapp-service.ts` to use template IDs
3. Pass template parameters instead of full message

### Webhook Integration

To receive delivery status updates:

1. Set up webhooks in Twilio Console
2. Configure your backend to handle webhook events
3. Track message delivery status

### Batch Sending

To send multiple notifications efficiently:

1. Queue messages in a database
2. Use Twilio's batch API
3. Monitor delivery status

## References

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [WhatsApp Business API Policies](https://www.whatsapp.com/business/api)
- [Twilio Pricing](https://www.twilio.com/pricing)

## Support

For issues or questions:
1. Check [Twilio Documentation](https://www.twilio.com/docs)
2. Visit [Twilio Support](https://support.twilio.com)
3. Check application logs for error details

## Next Steps

1. ✅ Set up Twilio account
2. ✅ Configure environment variables
3. ✅ Test with sandbox
4. ✅ Set up production WhatsApp Business Account
5. ✅ Deploy to production
6. ✅ Monitor delivery metrics
