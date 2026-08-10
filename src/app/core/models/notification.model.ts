export type TypeNotification =
  | 'RESERVATION'
  | 'ANNULATION'
  | 'REALISATION'
  | 'ABSENCE'
  | 'CONFLIT'
  | 'PROPOSITION'
  | 'RAPPEL';

export interface NotificationResponse {
  id: string;
  type: TypeNotification;
  contenu: string;
  isRead: boolean;
  createdAt: string;
}
