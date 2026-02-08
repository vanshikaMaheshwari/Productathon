# Twilio WhatsApp Integration - Complete Guide

## Overview

This application now integrates **Twilio** as the WhatsApp provider for sending automated lead notifications to sales officers. When a new lead is created, the system automatically sends a formatted WhatsApp message with key lead information.

## Architecture

### Components

1. **WhatsApp Service** (`/src/services/whatsapp-service.ts`)
   - Core service for sending WhatsApp messages
   - Handles message formatting and validation
   - Implements error handling and fallback logic

2. **Twilio Configuration** (`/src/services/twilio-config.ts`)
   - Manages Twilio API credentials
   - Provides helper functions for API calls
   - Validates phone numbers in E.164 format

3. **WhatsApp Handler** (`/src/services/whatsapp-handler.ts`)
   - Processes WhatsApp send requests
   - Validates input and phone numbers
   - Handles API responses

4. **Lead Creation Hook** (`/src/hooks/use-lead-creation.ts`)
   - React hook for creating leads
   - Triggers WhatsApp notifications automatically
   - Manages loading and error states

5. **Create Lead Page** (`/src/components/pages/CreateLeadPage.tsx`)
   - User interface for creating new leads
   - Form validation and submission
   - WhatsApp notification settings

## Quick Start

### 1. Set Up Twilio Account

```bash
# Visit https://www.twilio.com and sign up for a free account
# Free tier includes:
# - 100 WhatsApp messages/month
# - Full API access
# - Sandbox environment for testing
```

### 2. Get Your Credentials

1. Log in to [Twilio Console](https://console.twilio.com)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Set up WhatsApp:
   - Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Follow the setup wizard
   - Get your sandbox WhatsApp number (e.g., +1234567890)

### 3. Configure Environment Variables

Create or update your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### 4. Test the Integration

1. Navigate to `/create-lead` in your application
2. Fill in the lead information:
   - Company Name (required)
   - Industry Type
   - Plant Locations
   - Contact Information
   - Lead Score (0-100)
   - Trust Score (0-100)
   - Status (Cold/Warm/Hot/Accepted)
   - Product Recommendations
   - Reason Codes

3. Enable "Send WhatsApp notification to sales officer"
4. Enter a phone number in E.164 format (e.g., +1234567890)
5. Click "Create Lead & Notify"

## Phone Number Format (E.164)

All phone numbers must be in **E.164 format**:

```
+[country code][number]
```

### Examples

| Country | Format | Example |
|---------|--------|---------|
| USA | +1 + 10 digits | +12025551234 |
| India | +91 + 10 digits | +919876543210 |
| UK | +44 + 10 digits | +441632960000 |
| Canada | +1 + 10 digits | +14165551234 |
| Australia | +61 + 9 digits | +61291234567 |

### How to Convert

- Remove all spaces, dashes, and parentheses
- Add `+` at the beginning
- Add country code
- Examples:
  - ❌ `(202) 555-1234` → ✅ `+12025551234`
  - ❌ `919876543210` → ✅ `+919876543210`

## Message Format

The system generates formatted WhatsApp messages with the following structure:

```
🚨 NEW HIGH-INTENT LEAD

Target: [Company Name]
Need: [Product Recommendations] (Based on [Reason Codes])

Urgency: [High/Medium/Low]
Confidence Score: [Trust Score]%

Dossier Link: [Lead Details URL]
Next Best Action: [Suggested Action]

Industry: [Industry Type]
Location: [Plant Locations]
Contact: [Contact Information]
```

### Example Message

```
🚨 NEW HIGH-INTENT LEAD

Target: Acme Manufacturing Corp
Need: Premium Industrial Package (Based on High demand signal)

Urgency: High 🔴
Confidence Score: 75%

Dossier Link: https://yourapp.com/leads/abc-123-def
Next Best Action: Schedule immediate site visit

Industry: Manufacturing
Location: Maharashtra, India
Contact: contact@acme.com
```

### Urgency Levels

- **High** 🔴: Lead Score > 75
- **Medium** 🟡: Lead Score 50-75
- **Low** 🟢: Lead Score < 50

### Next Best Actions

- **Hot**: Schedule immediate site visit
- **Warm**: Initial outreach call
- **Cold**: Research and qualification
- **Default**: Initial contact

## API Integration Details

### Request Flow

```
User Creates Lead
    ↓
CreateLeadPage.tsx (Frontend)
    ↓
useLeadCreation Hook
    ↓
BaseCrudService.create() (Save to DB)
    ↓
notifySalesOfficer() (Async)
    ↓
WhatsAppService.sendLeadAlert()
    ↓
fetch('/api/whatsapp/send') (HTTP Request)
    ↓
whatsapp-handler.ts (Validation)
    ↓
twilio-config.ts (Twilio API Call)
    ↓
Twilio API
    ↓
WhatsApp Message Sent to Recipient
```

### API Endpoint

**POST** `/api/whatsapp/send`

**Request Body:**
```json
{
  "toPhone": "+1234567890",
  "message": "🚨 NEW HIGH-INTENT LEAD\n\nTarget: Acme Corp\n..."
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

## Validation

### Phone Number Validation

- Must be in E.164 format: `+[1-9]\d{1,14}`
- Examples:
  - ✅ `+12025551234`
  - ✅ `+919876543210`
  - ❌ `2025551234` (missing +)
  - ❌ `+1 (202) 555-1234` (spaces/formatting)

### Message Validation

- Maximum length: 4,096 characters
- Must not be empty
- Special characters are allowed

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid phone number format | Phone not in E.164 format | Use format: +[country code][number] |
| Missing Twilio configuration | Environment variables not set | Add TWILIO_* variables to .env |
| Message exceeds maximum length | Message > 4,096 characters | Shorten the message |
| Twilio API error | Invalid credentials or account issue | Check Twilio Console for details |
| Network error | Connection issue | Check internet connection |

### Fallback Behavior

If WhatsApp notification fails:
1. Error is logged to console
2. Lead is still created successfully
3. Notification failure is recorded
4. Future enhancement: Fallback to SMS or Email

## Pricing

### Twilio WhatsApp Pricing

- **Inbound messages**: $0.0075 per message
- **Outbound messages**: $0.0075 per message
- **Free tier**: 100 messages/month for testing

### Cost Estimation

| Volume | Monthly Cost |
|--------|--------------|
| 100 messages | Free (within free tier) |
| 500 messages | $3.75 |
| 1,000 messages | $7.50 |
| 5,000 messages | $37.50 |
| 10,000 messages | $75.00 |

## Development vs Production

### Development (Sandbox)

- Use Twilio WhatsApp sandbox
- Free tier: 100 messages/month
- Limited to verified phone numbers
- Great for testing

**Setup:**
1. Create Twilio account
2. Go to WhatsApp sandbox
3. Send activation code to your WhatsApp
4. Use your phone number for testing

### Production

- Use official WhatsApp Business Account
- Requires business verification
- Unlimited messages (pay-per-message)
- Full compliance with WhatsApp policies

**Setup:**
1. Complete WhatsApp Business Account verification
2. Get official WhatsApp Business number
3. Update `TWILIO_WHATSAPP_NUMBER` in .env
4. Deploy to production

## Security Best Practices

1. **Never commit credentials**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **Rotate tokens regularly**
   - Change auth tokens every 90 days
   - Use Twilio Console to regenerate

3. **Use HTTPS**
   - All API calls use HTTPS
   - Ensure your backend uses HTTPS

4. **Rate limiting**
   - Implement rate limiting to prevent abuse
   - Monitor for unusual activity

5. **Input validation**
   - Phone numbers are validated before sending
   - Messages are checked for length

6. **Monitor usage**
   - Check Twilio Console for delivery status
   - Review logs for errors

## Monitoring & Logging

### Success Metrics

Track in your application:
```typescript
const metrics = {
  leadsCreated: 0,
  notificationsSent: 0,
  notificationsFailed: 0,
  averageDeliveryTime: 0,
};
```

### Debug Logging

Enable debug logging in development:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('WhatsApp message:', message);
  console.log('Recipient:', toPhone);
  console.log('Lead:', lead);
}
```

### Twilio Console

Monitor messages in [Twilio Console](https://console.twilio.com):
1. Go to **Messaging** → **Logs**
2. View all sent messages
3. Check delivery status
4. Review error details

## Troubleshooting

### Issue: "Missing Twilio configuration"

**Cause**: Environment variables not set

**Solution**:
```bash
# Check if variables are set
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_WHATSAPP_NUMBER

# If empty, add to .env file
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### Issue: "Invalid phone number format"

**Cause**: Phone number not in E.164 format

**Solution**:
- Use format: `+[country code][number]`
- Examples: `+12025551234`, `+919876543210`
- Remove spaces, dashes, parentheses

### Issue: Message not delivered

**Cause**: Multiple possible reasons

**Solution**:
1. Verify recipient has WhatsApp installed
2. Check phone number is correct
3. Review Twilio Console logs
4. Ensure Twilio account has balance
5. Check WhatsApp policies compliance

### Issue: "Twilio API error"

**Cause**: Invalid credentials or account issue

**Solution**:
1. Verify credentials in Twilio Console
2. Check account status
3. Ensure WhatsApp is enabled
4. Review API documentation

### Issue: Lead created but notification not sent

**Cause**: Notification settings or phone number issue

**Solution**:
1. Check "Send WhatsApp notification" is enabled
2. Verify phone number format
3. Check browser console for errors
4. Review server logs

## Advanced Configuration

### Custom Message Templates

To use WhatsApp message templates:

1. Create templates in Twilio Console
2. Update `whatsapp-service.ts` to use template IDs
3. Pass template parameters

### Webhook Integration

To receive delivery status:

1. Set up webhooks in Twilio Console
2. Configure backend to handle events
3. Track delivery status

### Batch Sending

To send multiple notifications:

1. Queue messages in database
2. Use Twilio batch API
3. Monitor delivery

## Testing

### Unit Tests

```typescript
import { WhatsAppService } from '@/services/whatsapp-service';

describe('WhatsAppService', () => {
  it('should validate E.164 phone numbers', () => {
    const service = new WhatsAppService();
    expect(service.isValidPhoneNumber('+12025551234')).toBe(true);
    expect(service.isValidPhoneNumber('2025551234')).toBe(false);
  });

  it('should generate correct message format', () => {
    const service = new WhatsAppService();
    const lead = {
      _id: '123',
      companyName: 'Test Corp',
      leadScore: 85,
      trustScore: 75,
    };
    const message = service.generateLeadAlertMessage(lead, 'http://example.com');
    expect(message).toContain('Test Corp');
    expect(message).toContain('High');
  });
});
```

### Integration Tests

```typescript
// Test with mock Twilio API
const mockTwilioAPI = {
  sendMessage: jest.fn().mockResolvedValue({ success: true })
};

// Test lead creation workflow
const lead = await createLead(leadData, { notifyOfficer: true });
expect(mockTwilioAPI.sendMessage).toHaveBeenCalled();
```

## References

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [WhatsApp Business API Policies](https://www.whatsapp.com/business/api)
- [Twilio Pricing](https://www.twilio.com/pricing)

## Support

For issues or questions:

1. **Check Twilio Documentation**: [twilio.com/docs](https://www.twilio.com/docs)
2. **Twilio Support**: [support.twilio.com](https://support.twilio.com)
3. **Application Logs**: Check browser console and server logs
4. **Twilio Console**: Monitor message logs and account status

## Next Steps

1. ✅ Create Twilio account
2. ✅ Set up WhatsApp sandbox
3. ✅ Configure environment variables
4. ✅ Test with `/create-lead` page
5. ⬜ Set up production WhatsApp Business Account
6. ⬜ Deploy to production
7. ⬜ Monitor delivery metrics
8. ⬜ Implement advanced features (templates, webhooks, batch sending)
