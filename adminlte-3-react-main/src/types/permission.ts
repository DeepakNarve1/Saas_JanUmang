export type SidebarAccessMap = Record<string, string[]>;

export interface ISidebarPermissionsResponse {
  data: SidebarAccessMap;
}
