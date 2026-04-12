export type ActivityAction =
  | 'asset_created'
  | 'asset_updated'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'event_reminder_added'
  | 'doc_uploaded'
  | 'image_uploaded'
  | 'doc_deleted'
  | 'image_deleted'
  | 'doc_renamed'
  | 'doc_folder_renamed'
  | 'doc_folder_deleted'
  | 'tab_added'
  | 'tab_moved'
  | 'tab_removed';

export type Activity = {
  id: number;
  assetId: number;
  userId: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  action: ActivityAction;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: {
    eventName?: string;
    eventColor?: string | null;
    fileName?: string;
    fileId?: string;
    url?: string;
    oldName?: string;
    newName?: string;
    tabName?: string;
    fromIndex?: number;
    toIndex?: number;
    changeType?: string;
    oldStart?: string;
    newStart?: string;
    oldEnd?: string;
    newEnd?: string;
    oldDescription?: string;
    newDescription?: string;
    oldLocation?: string;
    newLocation?: string;
    oldColor?: string;
    newColor?: string;
    oldAssetId?: number;
    newAssetId?: number;
    oldAssetName?: string;
    newAssetName?: string;
    reminderMinutes?: number[];
  } | null;
  createdAt: string | Date;
  assetName?: string | null;
  assetType?: string | null;
  assetTabs?: string[] | null;
};
