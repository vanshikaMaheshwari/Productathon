import { CustomerLeads, RegionalOffices } from '@/entities';

/**
 * WhatsApp Service for sending lead alerts to sales officers
 */
export class WhatsAppService {
  /**
   * Send a lead alert via WhatsApp to a sales officer
   * @param toPhone - Phone number in E.164 format (e.g., +1234567890)
   * @param lead - The lead object containing details
   * @param leadUrl - URL to the lead details page
   * @returns Promise<boolean> - Whether the message was sent successfully
   */
  async sendLeadAlert(
    toPhone: string,
    lead: CustomerLeads,
    leadUrl: string
  ): Promise<boolean> {
    try {
      const message = this.generateLeadAlertMessage(lead, leadUrl);
      
      // Send via WhatsApp API (using Twilio or similar service)
      // This is a placeholder for the actual API call
      const response = await this.sendWhatsAppMessage(toPhone, message);
      
      return response.success;
    } catch (error) {
      console.error('Failed to send WhatsApp alert:', error);
      // Fallback: Log for manual follow-up or trigger alternative notification
      this.logFailedNotification(toPhone, lead);
      return false;
    }
  }

  /**
   * Generate a formatted WhatsApp message for lead alert
   */
  private generateLeadAlertMessage(lead: CustomerLeads, leadUrl: string): string {
    const urgency = this.getUrgencyLevel(lead.leadScore || 0);
    const confidenceScore = lead.trustScore || 0;
    
    return `🚨 NEW HIGH-INTENT LEAD

Target: ${lead.companyName || 'Company Name'}
Need: ${lead.productRecommendations || 'Product TBD'} (Based on ${lead.reasonCodes || 'Market Signal'})

Urgency: ${urgency}
Confidence Score: ${confidenceScore}%

Dossier Link: ${leadUrl}
Next Best Action: ${this.getNextAction(lead.status)}

Industry: ${lead.industryType || 'N/A'}
Location: ${lead.plantLocations || 'N/A'}
Contact: ${lead.contactInformation || 'N/A'}`;
  }

  /**
   * Determine urgency level based on lead score
   */
  private getUrgencyLevel(score: number): string {
    if (score > 75) return 'High 🔴';
    if (score > 50) return 'Medium 🟡';
    return 'Low 🟢';
  }

  /**
   * Determine next action based on lead status
   */
  private getNextAction(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'hot':
        return 'Schedule immediate site visit';
      case 'warm':
        return 'Initial outreach call';
      case 'cold':
        return 'Research and qualification';
      default:
        return 'Initial contact';
    }
  }

  /**
   * Send WhatsApp message via API
   * This is a placeholder - implement with your WhatsApp provider (Twilio, MessageBird, etc.)
   */
  private async sendWhatsAppMessage(
    toPhone: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // TODO: Implement actual WhatsApp API integration
      // Example with Twilio:
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // const response = await client.messages.create({
      //   from: 'whatsapp:+1234567890',
      //   to: `whatsapp:${toPhone}`,
      //   body: message
      // });
      
      // For now, log the message that would be sent
      console.log('WhatsApp message would be sent to:', toPhone);
      console.log('Message:', message);
      
      // Simulate successful send
      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
      console.error('WhatsApp API error:', error);
      return { success: false };
    }
  }

  /**
   * Log failed notifications for fallback handling (SMS, Email, etc.)
   */
  private logFailedNotification(toPhone: string, lead: CustomerLeads): void {
    console.warn('Failed WhatsApp notification for:', {
      phone: toPhone,
      leadId: lead._id,
      company: lead.companyName,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement fallback notification (SMS, Email, etc.)
    // This could trigger an alternative notification method
  }
}

/**
 * Notify sales officer about a new lead
 * @param lead - The newly created lead
 * @param officerPhone - Sales officer's phone number
 * @param leadUrl - URL to the lead details page
 */
export async function notifySalesOfficer(
  lead: CustomerLeads,
  officerPhone: string,
  leadUrl: string
): Promise<boolean> {
  const whatsapp = new WhatsAppService();
  
  try {
    const sent = await whatsapp.sendLeadAlert(officerPhone, lead, leadUrl);
    
    if (!sent) {
      console.warn('WhatsApp notification failed, triggering fallback...');
      // Hook for fallback (SMS / Email later)
      // await triggerFallbackNotification(lead, officerPhone);
    }
    
    return sent;
  } catch (error) {
    console.error('Error notifying sales officer:', error);
    return false;
  }
}
