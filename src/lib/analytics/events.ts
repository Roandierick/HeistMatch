// Consistent object_action event names. Add new events here first.
export const EVENTS = {
  pageView: "page_view",
  searchPerformed: "search_performed",
  filterApplied: "filter_applied",
  heistCreated: "heist_created",
  heistJoinClicked: "heist_join_clicked",
  heistJoined: "heist_joined",
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  emailVerified: "email_verified",
  newsletterSubscribed: "newsletter_subscribed",
  newsletterConfirmed: "newsletter_confirmed",
  blogCtaClicked: "blog_cta_clicked",
  reportSubmitted: "report_submitted",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
