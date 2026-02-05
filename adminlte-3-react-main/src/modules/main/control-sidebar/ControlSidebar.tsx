import { useCallback, useEffect } from "react";
import {
  setNavbarVariant,
  setSidebarSkin,
  toggleDarkMode,
  toggleFooterFixed,
  toggleHeaderBorder,
  toggleHeaderFixed,
  toggleLayoutBoxed,
  toggleLayoutFixed,
  toggleMenuChildIndent,
  toggleMenuItemFlat,
  toggleSidebarMenu,
  toggleTopNavigation,
} from "@app/store/reducers/ui";
import {
  NAVBAR_DARK_VARIANTS,
  NAVBAR_LIGHT_VARIANTS,
  SIDEBAR_DARK_SKINS,
  SIDEBAR_LIGHT_SKINS,
} from "@app/utils/themes";
import useScrollPosition from "@app/hooks/useScrollPosition";
import Checkbox from "@app/components/Checkbox";
import { useAppDispatch, useAppSelector } from "@app/store/store";
import { addWindowClass, removeWindowClass } from "@app/utils/helpers";

const Select = ({ value, options, onChange, style, disabled }: any) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="block w-full rounded-md border-gray-600 bg-slate-700 py-1.5 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    style={style}
  >
    {options &&
      options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
  </select>
);

const ControlSidebar = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const headerBorder = useAppSelector((state) => state.ui.headerBorder);
  const headerFixed = useAppSelector((state) => state.ui.headerFixed);
  const footerFixed = useAppSelector((state) => state.ui.footerFixed);
  const layoutFixed = useAppSelector((state) => state.ui.layoutFixed);
  const navbarVariant = useAppSelector((state) => state.ui.navbarVariant);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const layoutBoxed = useAppSelector((state) => state.ui.layoutBoxed);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed,
  );
  const controlSidebarCollapsed = useAppSelector(
    (state) => state.ui.controlSidebarCollapsed,
  );
  const scrollPosition = useScrollPosition();

  const handleDarkModeChange = () => {
    dispatch(toggleDarkMode());
  };

  const handleHeaderBorderChange = () => {
    dispatch(toggleHeaderBorder());
  };

  const handleHeaderFixedChange = () => {
    dispatch(toggleHeaderFixed());
  };

  const handleFooterFixedChange = () => {
    dispatch(toggleFooterFixed());
  };

  const handleLayoutBoxedChange = () => {
    dispatch(toggleLayoutBoxed());
  };

  const handleTopNavigationChange = () => {
    dispatch(toggleTopNavigation());
  };

  const handleLayoutFixedChange = () => {
    dispatch(toggleLayoutFixed());
  };

  const onNavbarVariantChange = (value: string) => {
    dispatch(setNavbarVariant(value));
  };

  const onSidebarSkinChange = (value: string) => {
    dispatch(setSidebarSkin(value));
  };

  const handleMenuItemFlatChange = () => {
    dispatch(toggleMenuItemFlat());
  };

  const handleMenuChildIndentChange = () => {
    dispatch(toggleMenuChildIndent());
  };

  const handleMenuSidebarCollapsed = () => {
    dispatch(toggleSidebarMenu());
  };

  const getContainerPaddingTop = useCallback(() => {
    if (headerFixed) {
      return `${16 - (scrollPosition <= 16 ? scrollPosition : 0)}px`;
    }
    return `${73 - (scrollPosition <= 57 ? scrollPosition : 57)}px`;
  }, [scrollPosition, headerFixed]);

  useEffect(() => {
    if (footerFixed) {
      addWindowClass("layout-footer-fixed");
    } else {
      removeWindowClass("layout-footer-fixed");
    }
  }, [footerFixed]);

  useEffect(() => {
    if (headerFixed) {
      addWindowClass("layout-navbar-fixed");
    } else {
      removeWindowClass("layout-navbar-fixed");
    }
  }, [headerFixed]);

  useEffect(() => {
    if (layoutBoxed) {
      addWindowClass("layout-boxed");
    } else {
      removeWindowClass("layout-boxed");
    }
  }, [layoutBoxed]);

  useEffect(() => {
    if (layoutFixed) {
      addWindowClass("layout-fixed");
    } else {
      removeWindowClass("layout-fixed");
    }
  }, [layoutFixed]);

  useEffect(() => {
    if (darkMode) {
      addWindowClass("dark-mode");
    } else {
      removeWindowClass("dark-mode");
    }
  }, [darkMode]);

  return (
    <aside
      className={`fixed top-0 right-0 z-1038 h-full w-[250px] bg-slate-800 text-gray-300 transition-transform duration-300 ease-in-out border-l border-slate-700 shadow-xl ${
        controlSidebarCollapsed ? "translate-x-[250px]" : "translate-x-0"
      }`}
      style={{
        paddingTop: getContainerPaddingTop(),
        paddingBottom: footerFixed ? "57px" : "0px",
        overflowY: "auto",
      }}
    >
      <div className="p-4">
        <h5 className="mb-4 text-white font-semibold">Customize Jan Umang</h5>

        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center mb-3">
            <Checkbox checked={darkMode} onChange={handleDarkModeChange} />
            <label className="ml-2 cursor-pointer font-medium">Dark mode</label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              checked={layoutBoxed}
              onChange={handleLayoutBoxedChange}
            />
            <label className="ml-2 cursor-pointer font-medium">Boxed</label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              checked={topNavigation}
              onChange={handleTopNavigationChange}
            />
            <label className="ml-2 cursor-pointer font-medium">
              Top Navigation
            </label>
          </div>
        </div>

        <h6 className="mb-3 text-gray-400 text-sm uppercase tracking-wide">
          Header Options
        </h6>
        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={layoutBoxed}
              checked={headerFixed}
              onChange={handleHeaderFixedChange}
            />
            <label className="ml-2 cursor-pointer font-medium">Fixed</label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              checked={headerBorder}
              onChange={handleHeaderBorderChange}
            />
            <label className="ml-2 cursor-pointer font-medium">No Border</label>
          </div>
        </div>

        <h6 className="mb-3 text-gray-400 text-sm uppercase tracking-wide">
          Sidebar Options
        </h6>
        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={topNavigation}
              checked={menuSidebarCollapsed}
              onChange={handleMenuSidebarCollapsed}
            />
            <label className="ml-2 cursor-pointer font-medium">Collapse</label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={layoutBoxed}
              checked={layoutFixed}
              onChange={handleLayoutFixedChange}
            />
            <label className="ml-2 cursor-pointer font-medium">Fixed</label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={topNavigation}
              checked={menuItemFlat}
              onChange={handleMenuItemFlatChange}
            />
            <label className="ml-2 cursor-pointer font-medium">
              Nav Flat Style
            </label>
          </div>
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={topNavigation}
              checked={menuChildIndent}
              onChange={handleMenuChildIndentChange}
            />
            <label className="ml-2 cursor-pointer font-medium">
              Nav Child Indent
            </label>
          </div>
        </div>

        <h6 className="mb-3 text-gray-400 text-sm uppercase tracking-wide">
          Footer Options
        </h6>
        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center mb-3">
            <Checkbox
              disabled={layoutBoxed}
              checked={footerFixed}
              onChange={handleFooterFixedChange}
            />
            <label className="ml-2 cursor-pointer font-medium">Fixed</label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Light Navbar Variants
          </label>
          <Select
            value={navbarVariant}
            options={NAVBAR_LIGHT_VARIANTS}
            onChange={(e: any) => onNavbarVariantChange(e?.target?.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Dark Navbar Variants</label>
          <Select
            value={navbarVariant}
            options={NAVBAR_DARK_VARIANTS}
            onChange={(e: any) => onNavbarVariantChange(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Accent Color Variants
          </label>
          <Select options={[]} disabled style={{ width: "100%" }} />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Light Sidebar Variants
          </label>
          <Select
            value={sidebarSkin}
            options={SIDEBAR_LIGHT_SKINS}
            onChange={(e: any) => onSidebarSkinChange(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Dark Sidebar Variants
          </label>
          <Select
            value={sidebarSkin}
            options={SIDEBAR_DARK_SKINS}
            onChange={(e: any) => onSidebarSkinChange(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Brand Logo Variants</label>
          <Select options={[]} disabled style={{ width: "100%" }} />
        </div>
      </div>
    </aside>
  );
};

export default ControlSidebar;
