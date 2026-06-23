# n8n workflow outlines

1. **Student registration:** webhook → validate → normalize country/package → CRM/Sheet → confirmation → regional queue.
2. **Parent webinar:** webhook → deduplicate → calendar/email confirmation → reminder sequence → attendance update.
3. **Partner inquiry:** webhook → classify organization → founder alert → follow-up task → pipeline record.
4. **Diagnostic delivery:** new free lead → send links → 48-hour reminder → completion tag.
5. **Paid onboarding:** payment event/manual approval → welcome email → cohort assignment → community invite.
6. **Weekly class reminders:** cohort schedule → timezone conversion → 24-hour and 1-hour reminders.
7. **Homework reminders:** assignment publish → student reminder → incomplete follow-up.
8. **Monthly mock:** release → timed instructions → submission reminder → result capture.
9. **Parent reports:** aggregate attendance, homework, mock, AI usage → review → send.
10. **Free-to-paid conversion:** diagnostic/webinar completed → segmented founder offer → follow-up.
11. **Regional segmentation:** country/time preference → cohort label → WhatsApp/Telegram routing.

Use signed or secret webhook URLs, minimum necessary personal data, retries, and an error queue before production.
