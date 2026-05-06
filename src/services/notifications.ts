export interface NotificationPayload {
  type: 'sms' | 'email' | 'push';
  caregiverId: string;
  patientId: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Service to simulate external notifications (SMS/Email) to caregivers via a backend service.
 * In production, this would hit Twilio, SendGrid, or Firebase Cloud Messaging.
 */
export const notificationService = {
  send: async (payload: NotificationPayload) => {
    console.log(`[Notification Service] Sending ${payload.priority} ${payload.type} to caregiver ${payload.caregiverId}: "${payload.message}"`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate success
    return { success: true, timestamp: new Date().toISOString() };
  },
  
  escalateConfusion: async (patientId: string, caregiverId: string, stepContext: string) => {
    return notificationService.send({
      type: 'sms',
      caregiverId,
      patientId,
      message: `ALERT: Patient has indicated confusion while attempting step: "${stepContext}". Please review or initiate a video call.`,
      priority: 'high'
    });
  },
  
  escalateMissedMedication: async (patientId: string, caregiverId: string, routineName: string) => {
    return notificationService.send({
      type: 'sms',
      caregiverId,
      patientId,
      message: `CRITICAL: Patient missed the expected window for routine "${routineName}". Please check on them immediately.`,
      priority: 'critical'
    });
  }
};
