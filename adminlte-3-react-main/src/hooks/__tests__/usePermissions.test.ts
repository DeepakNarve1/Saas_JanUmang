import { renderHook } from "@testing-library/react";
import { usePermissions } from "../usePermissions";
import { useAppSelector } from "@app/store/store";

// Mock the Redux store
jest.mock("@app/store/store", () => ({
  useAppSelector: jest.fn(),
}));

describe("usePermissions", () => {
  const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
  >;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("hasPermission", () => {
    it("should return false when user is not logged in", () => {
      mockUseAppSelector.mockReturnValue(null);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(false);
    });

    it("should return false when user has no role", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Test User",
        role: null,
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(false);
    });

    it("should return true for superadmin with string role", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Admin User",
        role: "superadmin",
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(true);
      expect(result.current.hasPermission("delete_users")).toBe(true);
    });

    it("should return true for superadmin with object role", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Admin User",
        role: {
          name: "superadmin",
          permissions: [],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(true);
    });

    it("should return true when user has the specific permission (string format)", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users", "edit_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(true);
      expect(result.current.hasPermission("edit_users")).toBe(true);
    });

    it("should return true when user has the specific permission (object format)", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [{ name: "view_users" }, { name: "edit_users" }],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(true);
      expect(result.current.hasPermission("edit_users")).toBe(true);
    });

    it("should return false when user does not have the permission", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("delete_users")).toBe(false);
    });

    it("should return false when permissions array is empty", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission("view_users")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if user has at least one of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(["view_users", "delete_users"]),
      ).toBe(true);
    });

    it("should return false if user has none of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(["delete_users", "create_users"]),
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true if user has all of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users", "edit_users", "delete_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(["view_users", "edit_users"]),
      ).toBe(true);
    });

    it("should return false if user is missing any of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: ["view_users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(["view_users", "delete_users"]),
      ).toBe(false);
    });
  });

  describe("hasSidebarAccess", () => {
    it("should return true for superadmin", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Admin User",
        role: {
          name: "superadmin",
          sidebarAccess: [],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasSidebarAccess("/users")).toBe(true);
    });

    it("should return true when user has wildcard access", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          sidebarAccess: ["*"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasSidebarAccess("/users")).toBe(true);
    });

    it("should return true when user has specific path access", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          sidebarAccess: ["/users", "/roles"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasSidebarAccess("/users")).toBe(true);
      expect(result.current.hasSidebarAccess("/roles")).toBe(true);
    });

    it("should return false when user does not have path access", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          sidebarAccess: ["/users"],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasSidebarAccess("/admin")).toBe(false);
    });
  });
});
