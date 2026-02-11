export type CalDavCalendar = {
  id: string;
  name: string;
  url: string;
  isPrimary?: boolean;
  syncToken?: string | number;
};
