import { renderHook } from "@testing-library/react";
import { usePermissions } from "../usePermissions";
import { useAppSelector } from "@app/store/store";
import { PERMISSIONS } from "@app/config/permissions";

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

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(false);
    });

    it("should return false when user has no role", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Test User",
        role: null,
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(false);
    });

    it("should return true for superadmin with string role", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Admin User",
        role: "superadmin",
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(true);
      expect(result.current.hasPermission(PERMISSIONS.DELETE_USERS)).toBe(true);
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

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(true);
    });

    it("should return true when user has the specific permission (string format)", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [PERMISSIONS.VIEW_USERS, PERMISSIONS.EDIT_USERS],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(true);
      expect(result.current.hasPermission(PERMISSIONS.EDIT_USERS)).toBe(true);
    });

    it("should return true when user has the specific permission (object format)", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [
            { name: PERMISSIONS.VIEW_USERS },
            { name: PERMISSIONS.EDIT_USERS },
          ],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(true);
      expect(result.current.hasPermission(PERMISSIONS.EDIT_USERS)).toBe(true);
    });

    it("should return false when user does not have the permission", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [PERMISSIONS.VIEW_USERS],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(PERMISSIONS.DELETE_USERS)).toBe(
        false,
      );
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

      expect(result.current.hasPermission(PERMISSIONS.VIEW_USERS)).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if user has at least one of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [PERMISSIONS.VIEW_USERS],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission([
          PERMISSIONS.VIEW_USERS,
          PERMISSIONS.DELETE_USERS,
        ]),
      ).toBe(true);
    });

    it("should return false if user has none of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [PERMISSIONS.VIEW_USERS],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission([
          PERMISSIONS.DELETE_USERS,
          PERMISSIONS.CREATE_USERS,
        ]),
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true if user has all of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [
            PERMISSIONS.VIEW_USERS,
            PERMISSIONS.EDIT_USERS,
            PERMISSIONS.DELETE_USERS,
          ],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions([
          PERMISSIONS.VIEW_USERS,
          PERMISSIONS.EDIT_USERS,
        ]),
      ).toBe(true);
    });

    it("should return false if user is missing any of the permissions", () => {
      mockUseAppSelector.mockReturnValue({
        name: "Regular User",
        role: {
          name: "user",
          permissions: [PERMISSIONS.VIEW_USERS],
        },
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions([
          PERMISSIONS.VIEW_USERS,
          PERMISSIONS.DELETE_USERS,
        ]),
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
