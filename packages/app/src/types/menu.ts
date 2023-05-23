export interface MenuItem {
  id: string;
  icon?: string;
  text: string;
  children?: MenuItem[];
  path?: string;
}
