export interface ShopAnnouncement {
  text: string;
  href?: string | null;
  active: boolean;
}

export interface ShopAnnouncementsConfig {
  announcementsEnabled: boolean;
  announcements: ShopAnnouncement[];
}
