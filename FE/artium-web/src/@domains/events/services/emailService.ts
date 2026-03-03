import { mockProfiles } from "@domains/discover/mock/mockProfiles";
import type { HostingEvent } from "@domains/events/state/useHostingEventsStore";
import type { EmailTemplateData } from "@domains/events/types/invitation";

/**
 * Email service for sending event invitations (mock).
 */
class EmailService {
  async sendInvitations(eventId: string, recipientIds: string[]): Promise<void> {
    console.log("[MOCK] Sending invitations:", {
      eventId,
      recipientIds,
      recipientCount: recipientIds.length,
      timestamp: new Date().toISOString(),
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("[MOCK] Invitations sent successfully");
  }

  generateTemplateData(
    event: HostingEvent,
    recipientIds: string[],
  ): EmailTemplateData {
    const host = {
      fullName: "Huu Phan",
      username: "huuphan",
      avatarUrl: "https://i.pravatar.cc/96?img=1",
    };

    const recipients = recipientIds.map((id) => {
      const profile = mockProfiles.find((profile) => profile.id === id);
      return {
        id,
        fullName: profile?.fullName || "Unknown User",
        email: `${profile?.username || "unknown"}@artium.com`,
      };
    });

    return { event, host, recipients };
  }
}

export const emailService = new EmailService();
