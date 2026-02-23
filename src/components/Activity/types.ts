export type ActivityAction =
  | 'asset_created'
  | 'asset_updated'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'doc_uploaded'
  | 'image_uploaded';

export type Activity = {
  id: number;
  assetId: number;
  userId: string;
  action: ActivityAction;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: { eventName?: string; fileName?: string } | null;
  createdAt: string | Date;
  assetName?: string | null;
  assetType?: string | null;
};
