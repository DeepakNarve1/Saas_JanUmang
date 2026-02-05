import { useTranslation } from "react-i18next";

import packageJSON from "../../../../package.json";

const Footer = ({
  style = {},
  containered,
}: {
  style?: any;
  containered?: boolean;
}) => {
  const [t] = useTranslation();

  return (
    <footer
      className="bg-white dark:bg-[#17181A] border-t border-gray-200 dark:border-gray-800 py-4 px-6 text-sm text-gray-600 dark:text-gray-400 w-full relative z-1034 transition-[margin-left] duration-300 ease-in-out"
      style={{ ...style }}
    >
      <div
        className={`w-full flex justify-between items-center ${
          containered ? "container mx-auto" : ""
        }`}
      >
        <strong>
          <span>Copyright © {new Date().getFullYear()} </span>
          <a
            href="https://erdkse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            erdkse.com
          </a>
          <span>.</span>
        </strong>
        <div className="hidden sm:inline-block">
          <b>{t("footer.version")}</b>
          <span>&nbsp;{packageJSON.version}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
