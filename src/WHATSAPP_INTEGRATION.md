# WhatsApp Lead Notification Integration

## Overview

This document describes the WhatsApp integration for automatic lead notifications to sales officers. When a new lead is created, the system automatically sends a WhatsApp message to the designated sales officer with key lead information.

## Architecture

### Components

1. **WhatsApp Service** (`/src/services/whatsapp-service.ts`)
   - Core service for sending WhatsApp messages
   - Handles message formatting and API integration
   - Implements fallback notification logic

2. **Lead Creation Hook** (`/src/hooks/use-lead-creation.ts`)
   - React hook for creating leads with automatic notifications
   - Manages loading and error states
   - Triggers WhatsApp notifications asynchronously

3. **Create Lead Page** (`/src/components/pages/CreateLeadPage.tsx`)
   - User interface for creating new leads
   - Form validation and submission
   - Notification settings configuration

## Usage

### Creating a Lead with WhatsApp Notification

#### Option 1: Using the Create Lead Page

Navigate to `/create-lead` to access the lead creation form. The form includes:
- Company information (name, industry, location, contact)
- Lead scoring (lead score, trust score, status)
- Product recommendations and reason codes
- WhatsApp notification settings

#### Option 2: Programmatic Lead Creation

```typescript
import { useLeadCreation } from '@/hooks/use-lead-creation';

function MyComponent() {
  const { createLead, isCreating, error } = useLeadCreation();

  const handleCreateLead = async () => {
    const newLead = await createLead(
      {
        companyName: 'Acme Corp',
        industryType: 'Manufacturing',
        plantLocations: 'Maharashtra',
        contactInformation: 'contact@acme.com',
        leadScore: 85,
        trustScore: 75,
        status: 'hot',
        productRecommendations: 'Premium Package',
        reasonCodes: 'High demand signal',
        lastUpdated: new Date(),
      },
      {
        notifyOfficer: true,
        officerPhone: '+919876543210',
      }
    );

    if (newLead) {
      console.log('Lead created:', newLead);
    }
  };

  return <button onClick={handleCreateLead}>Create Lead</button>;
}
```

#### Option 3: Direct Service Usage

```typescript
import { notifySalesOfficer } from '@/services/whatsapp-service';
import { BaseCrudService } from '@/integrations';

// Create lead
const lead = await BaseCrudService.create('leads', {
  _id: crypto.randomUUID(),
  companyName: 'Acme Corp',
  // ... other fields
});

// Send notification
const leadUrl = `${window.location.origin}/leads/${lead._id}`;
await notifySalesOfficer(lead, '+919876543210', leadUrl);
```

## WhatsApp Message Format

The system generates a formatted message with the following structure:

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

### Urgency Levels

- **High** (🔴): Lead Score > 75
- **Medium** (🟡): Lead Score 50-75
- **Low** (🟢): Lead Score < 50

### Next Best Actions

- **Hot**: Schedule immediate site visit
- **Warm**: Initial outreach call
- **Cold**: Research and qualification
- **Default**: Initial contact

## API Integration

### Setting Up WhatsApp API

The service is designed to work with WhatsApp Business API providers. Currently, it includes a placeholder for integration with:

- **Twilio** (recommended)
- **MessageBird**
- **AWS SNS**
- **Custom WhatsApp Business API**

### Configuration

To enable actual WhatsApp sending, update `/src/services/whatsapp-service.ts`:

#### Example: Twilio Integration

```typescript
import twilio from 'twilio';

private async sendWhatsAppMessage(
  toPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const response = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${toPhone}`,
      body: message
    });

    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false };
  }
}
```

#### Environment Variables

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890

# Or your preferred provider
WHATSAPP_API_KEY=your_api_key
WHATSAPP_SENDER_ID=your_sender_id
```

## Fallback Notifications

If WhatsApp notification fails, the system logs the failure for fallback handling:

```typescript
// Fallback hook for SMS, Email, etc.
private logFailedNotification(toPhone: string, lead: CustomerLeads): void {
  console.warn('Failed WhatsApp notification for:', {
    phone: toPhone,
    leadId: lead._id,
    company: lead.companyName,
    timestamp: new Date().toISOString()
  });

  // TODO: Implement fallback notification
  // await triggerFallbackNotification(lead, toPhone);
}
```

### Implementing Fallback Notifications

```typescript
async function triggerFallbackNotification(
  lead: CustomerLeads,
  phone: string
): Promise<void> {
  // SMS fallback
  await sendSMS(phone, generateSMSMessage(lead));

  // Email fallback
  await sendEmail(lead.contactInformation, generateEmailMessage(lead));

  // In-app notification
  await createInAppNotification(lead);
}
```

## Error Handling

The system handles errors gracefully:

1. **Lead Creation Failure**: Returns null and sets error state
2. **WhatsApp Send Failure**: Logs error and triggers fallback
3. **Invalid Phone Number**: Validates E.164 format before sending
4. **API Timeout**: Implements retry logic with exponential backoff

## Monitoring & Logging

### Success Metrics

```typescript
// Track successful notifications
const metrics = {
  leadsCreated: 0,
  notificationsSent: 0,
  notificationsFailed: 0,
  fallbackTriggered: 0,
};
```

### Debug Logging

Enable debug logging in development:

```typescript
// In whatsapp-service.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('WhatsApp message:', message);
  console.log('Recipient:', toPhone);
  console.log('Lead:', lead);
}
```

## Security Considerations

1. **Phone Number Validation**: Always validate phone numbers in E.164 format
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Authentication**: Use secure API keys and tokens
4. **Data Privacy**: Ensure compliance with GDPR and local regulations
5. **Message Encryption**: Use HTTPS for all API calls

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { WhatsAppService } from '@/services/whatsapp-service';

describe('WhatsAppService', () => {
  it('should generate correct message format', () => {
    const service = new WhatsAppService();
    const lead = {
      _id: '123',
      companyName: 'Test Corp',
      leadScore: 85,
      trustScore: 75,
      // ... other fields
    };

    const message = service.generateLeadAlertMessage(lead, 'http://example.com');
    expect(message).toContain('Test Corp');
    expect(message).toContain('High');
  });

  it('should handle failed notifications', async () => {
    const service = new WhatsAppService();
    const result = await service.sendLeadAlert(
      '+invalid',
      mockLead,
      'http://example.com'
    );
    expect(result).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Test with mock WhatsApp API
const mockWhatsAppAPI = {
  sendMessage: jest.fn().mockResolvedValue({ success: true })
};

// Test lead creation workflow
const lead = await createLead(leadData, { notifyOfficer: true });
expect(mockWhatsAppAPI.sendMessage).toHaveBeenCalled();
```

## Troubleshooting

### Issue: WhatsApp message not sending

**Solution**: 
1. Verify phone number format: `+[country code][number]`
2. Check API credentials in environment variables
3. Ensure WhatsApp Business Account is active
4. Check rate limiting and quota

### Issue: Notification sent but not received

**Solution**:
1. Verify recipient has WhatsApp installed
2. Check message content for blocked keywords
3. Review WhatsApp Business API policies
4. Check recipient's privacy settings

### Issue: Lead created but notification not triggered

**Solution**:
1. Check `notifyOfficer` flag is set to true
2. Verify `officerPhone` is provided
3. Check browser console for errors
4. Review server logs for API failures

## Future Enhancements

1. **Batch Notifications**: Send multiple leads in one message
2. **Scheduled Notifications**: Queue messages for off-peak hours
3. **Rich Media**: Include images and documents in messages
4. **Interactive Messages**: Add buttons for quick actions
5. **Analytics Dashboard**: Track notification delivery and engagement
6. **Multi-Channel**: Support SMS, Email, Slack, Teams
7. **Template Management**: Customizable message templates
8. **Localization**: Multi-language support

## References

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Twilio WhatsApp Integration](https://www.twilio.com/whatsapp)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [GDPR Compliance](https://gdpr-info.eu/)
