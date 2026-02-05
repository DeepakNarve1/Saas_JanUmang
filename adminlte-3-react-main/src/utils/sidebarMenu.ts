import { MENU } from "@app/utils/menu";

export const flattenMenu = (items = MENU) => {
  const flattened: { name: string; path: string; resource?: string }[] = [];

  const walk = (list: any[]) => {
    list.forEach((item) => {
      if (item.path) flattened.push({ name: item.name, path: item.path, resource: item.resource });
      if (item.children) walk(item.children);
    });
  };

  walk(items);
  return flattened;
};
