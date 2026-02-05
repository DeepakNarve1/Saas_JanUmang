import { useState, useMemo } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@components";
import { useAppSelector } from "@app/store/store";
import { DEFAULT_SIDEBAR_ACCESS_BY_ROLE, MENU } from "@app/utils/menu";
import { Columns } from "lucide-react";
import { Button } from "@app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ISidebarPermissionsResponse,
  SidebarAccessMap,
} from "@app/types/permission";
import { IRole } from "@app/types/role";

const flattenMenu = (items = MENU) => {
  const flattened: { name: string; path?: string }[] = [];

  const walk = (list: typeof MENU) => {
    list.forEach((item) => {
      if (item.path) {
        flattened.push({ name: item.name, path: item.path });
      }
      if (item.children && item.children.length > 0) {
        walk(item.children as any);
      }
    });
  };

  walk(items as any);
  return flattened;
};

const PermissionsPage = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const queryClient = useQueryClient();

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    path: true,
    access: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = useMemo(() => flattenMenu(), []);

  const isSuperAdmin = useMemo(() => {
    const rolesList = Array.isArray(currentUser?.roles)
      ? currentUser?.roles
      : [];
    return (
      currentUser?.role === "superadmin" || rolesList.includes("superadmin")
    );
  }, [currentUser]);

  // Fetch Roles
  const { data: roles = [] } = useQuery<IRole[]>({
    queryKey: ["roles-list-simple"],
    queryFn: async () => {
      const res = await axios.get("/roles"); // Keeping the endpoint as per original file
      return res.data?.data || [];
    },
  });

  // Fetch Sidebar Permissions
  const {
    data: accessMap = DEFAULT_SIDEBAR_ACCESS_BY_ROLE,
    isLoading: isLoadingMap,
  } = useQuery<SidebarAccessMap>({
    queryKey: ["sidebar-permissions"],
    queryFn: async () => {
      const res = await axios.get("/rbac/sidebar-permissions");
      const map = res.data?.data;
      if (map && typeof map === "object" && !Array.isArray(map)) {
        // FORCE superadmin wildcard
        map.superadmin = ["*"];
        return map;
      }
      return DEFAULT_SIDEBAR_ACCESS_BY_ROLE;
    },
  });

  // Mutation to save permissions
  const saveMutation = useMutation({
    mutationFn: async (updatedMap: SidebarAccessMap) => {
      await axios.put("/rbac/sidebar-permissions", updatedMap);
      return updatedMap;
    },
    onSuccess: (data) => {
      toast.success("Sidebar permissions updated");
      localStorage.setItem("sidebarAccessByRole", JSON.stringify(data));
      queryClient.setQueryData(["sidebar-permissions"], data);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to save permissions");
    },
  });

  const handleTogglePath = (path: string) => {
    if (!selectedRole) {
      toast.warn("Select a role first");
      return;
    }

    const currentRoleAccess = accessMap?.[selectedRole] || [];
    const hasAccess = currentRoleAccess.includes(path);

    // Create new list
    let newRoleAccess: string[];
    if (hasAccess) {
      newRoleAccess = currentRoleAccess.filter((p) => p !== path);
    } else {
      newRoleAccess = [...currentRoleAccess, path];
    }

    // Update local cache optimistically or just update state if we were using state
    // Here we are using React Query data. We can't mutate accessMap directly if it comes from RQ.
    // We should ideally use a local state initialized from RQ data, OR use queryClient.setQueryData
    // But since the user has to click "Save", we need a local buffer.
    // So I will introduce a local state that syncs with `accessMap` when fetched.
  };

  // To implement the "Save" pattern correctly with React Query:
  // 1. We start with data from Query.
  // 2. We copy it to local state for editing.
  // 3. On Save, we mutate.

  // Let's re-introduce local state
  const [localMap, setLocalMap] = useState<SidebarAccessMap | null>(null);

  // Sync local map when data is loaded
  useMemo(() => {
    if (accessMap && !localMap) {
      setLocalMap(accessMap);
    }
  }, [accessMap, localMap]);

  // Also if accessMap updates from background refetch, we might want to respect that?
  // For "Edit form" usually we don't want background updates to overwrite user changes.
  // We'll rely on `localMap` for rendering if it exists.

  const safeMap = localMap || accessMap;

  const onTogglePath = (path: string) => {
    if (!selectedRole) {
      toast.warn("Select a role first");
      return;
    }

    if (!localMap) return; // Should be set by now if data loaded

    setLocalMap((prev) => {
      if (!prev) return prev;
      const roleAccess = new Set(prev[selectedRole] || []);
      if (roleAccess.has(path)) {
        roleAccess.delete(path);
      } else {
        roleAccess.add(path);
      }
      return { ...prev, [selectedRole]: Array.from(roleAccess) };
    });
  };

  const onSave = () => {
    if (selectedRole === "superadmin") {
      toast.info("Superadmin permissions are fixed and cannot be changed");
      return;
    }
    if (localMap) {
      saveMutation.mutate(localMap);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container-fluid">
        <ContentHeader title="Sidebar Permissions" />
        <div className="alert alert-warning mt-3">
          You do not have access to manage sidebar permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ContentHeader title="Sidebar Permissions" />
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Select Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-36 h-9 bg-white text-sm">
                  <SelectValue placeholder="-- Choose Role --" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r: any) => (
                    <SelectItem
                      key={r._id}
                      value={r.role || r.displayName || r.name || ""}
                    >
                      {r.displayName || r.name || r.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-[#00563B] hover:bg-[#368F8B]"
              disabled={!selectedRole || saveMutation.isPending || !localMap}
              onClick={onSave}
            >
              {saveMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </div>

        <div className="flex justify-start mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="w-4 h-4 mr-2" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {Object.keys(visibleColumns).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={visibleColumns[key as keyof typeof visibleColumns]}
                  onCheckedChange={() =>
                    toggleColumn(key as keyof typeof visibleColumns)
                  }
                >
                  {key === "name"
                    ? "Sidebar Item"
                    : key === "path"
                      ? "Path"
                      : "Visible for Role"}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                {visibleColumns.name && <th>Sidebar Item</th>}
                {visibleColumns.path && <th>Path</th>}
                {visibleColumns.access && (
                  <th className="text-center" style={{ width: 140 }}>
                    Visible for Role
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.path}>
                  {visibleColumns.name && <td>{item.name}</td>}
                  {visibleColumns.path && <td>{item.path}</td>}
                  {visibleColumns.access && (
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedRole === "superadmin"
                            ? true
                            : !!selectedRole &&
                              (safeMap?.[selectedRole] || []).includes(
                                item.path || "",
                              )
                        }
                        onChange={() => item.path && onTogglePath(item.path)}
                        disabled={
                          !selectedRole || selectedRole === "superadmin"
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
              {menuItems.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      Object.values(visibleColumns).filter(Boolean).length
                    }
                    className="text-center"
                  >
                    No menu items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isLoadingMap && !localMap && (
            <div className="text-center p-3 text-muted">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
