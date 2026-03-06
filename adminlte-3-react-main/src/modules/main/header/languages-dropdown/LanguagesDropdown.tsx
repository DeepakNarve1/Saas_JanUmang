"use client";
import { useEffect, useState, useRef } from "react";
import { Globe, Check, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@app/components/ui/dropdown-menu";
import { Button } from "@app/components/ui/button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

const languages = [
  { code: "en", label: "English", flag: "gb", name: "English" },
  { code: "hi", label: "हिन्दी", flag: "in", name: "Hindi" },
  { code: "tr", label: "Türkçe", flag: "tr", name: "Turkish" },
  { code: "es", label: "Español", flag: "es", name: "Spanish" },
  { code: "fr", label: "Français", flag: "fr", name: "French" },
  { code: "de", label: "Deutsch", flag: "de", name: "German" },
];

const LanguagesDropdown = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const initialized = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  const initGoogleWidget = () => {
    try {
      if (window.google?.translate?.TranslateElement) {
        // Clear previous instances
        const container = document.getElementById("google_translate_element");
        if (container) container.innerHTML = "";

        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,tr,es,fr,de",
            // Removing layout property often helps the combo box appear more reliably
            autoDisplay: false,
          },
          "google_translate_element",
        );

        // Use MutationObserver for better reliability than setInterval
        if (observerRef.current) observerRef.current.disconnect();

        const checkCombo = () => {
          const combo = document.querySelector(".goog-te-combo");
          if (combo) {
            setStatus("ready");
            if (observerRef.current) observerRef.current.disconnect();
            return true;
          }
          return false;
        };

        if (!checkCombo()) {
          observerRef.current = new MutationObserver(() => {
            if (checkCombo()) {
              observerRef.current?.disconnect();
            }
          });

          // Watch the entire body because Google inserts elements in various places
          observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Fallback timeout
          setTimeout(() => {
            if (status === "loading") {
              if (!checkCombo()) {
                console.error("❌ Google Translate combo box timed out");
                setStatus("error");
                observerRef.current?.disconnect();
              }
            }
          }, 15000);
        }
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setStatus("error");
    }
  };

  const loadScript = () => {
    if (initialized.current && status !== "error") return;

    setStatus("loading");
    window.googleTranslateElementInit = () => {
      initGoogleWidget();
    };

    // Remove old script if it exists
    const oldScript = document.getElementById("gt-script");
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.id = "gt-script";
    // Many adblockers block 'google.com' but allow 'googleapis.com'
    script.src =
      "//translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("❌ Google Translate script load failed");
      setStatus("error");
    };
    document.head.appendChild(script);
    initialized.current = true;
  };

  useEffect(() => {
    // Patch Node.prototype.removeChild to prevent React from crashing when
    // Google Translate modifies the DOM and React tries to reconcile it.
    if (typeof Node === "function" && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      // @ts-ignore
      Node.prototype.removeChild = function (this: Node, child: Node) {
        if (child.parentNode !== this) {
          if (console) {
            console.warn(
              "Google Translate workaround: Child not found in parent, skipping removeChild",
              child,
            );
          }
          return child;
        }
        return originalRemoveChild.apply(this, [child]);
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      // @ts-ignore
      Node.prototype.insertBefore = function (
        this: Node,
        newNode: Node,
        referenceNode: Node | null,
      ) {
        if (referenceNode && referenceNode.parentNode !== this) {
          if (console) {
            console.warn(
              "Google Translate workaround: Reference node not found in parent, skipping insertBefore",
              newNode,
              referenceNode,
            );
          }
          return newNode;
        }
        return originalInsertBefore.apply(this, [newNode, referenceNode]);
      } as any;
    }

    loadScript();
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const changeLanguage = (code: string) => {
    const select = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(code);
    } else {
      console.warn("❌ Translation failed: .goog-te-combo not found in DOM");
      // Try to re-init once if it's missing
      initGoogleWidget();
      setStatus("loading");
    }
    setIsOpen(false);
  };

  const currentSelection =
    languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block">
      {/* The widget container must be in the DOM for Google to inject into it */}
      <div
        id="google_translate_element"
        className="google-translate-container"
      />

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 h-10 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group"
          >
            <div className="relative flex items-center justify-center">
              <Globe
                className={`w-4 h-4 transition-colors ${
                  status === "error" ? "text-red-500" : "text-[#368f8b]"
                }`}
              />
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-[#368f8b]" />
                </div>
              )}
            </div>

            <span className="hidden md:inline-block text-sm font-medium dark:text-gray-200">
              {currentSelection.label}
            </span>

            <i
              className={`flag-icon flag-icon-${currentSelection.flag} rounded shadow-xs md:hidden`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-0 overflow-hidden dark:bg-[#1f2937]"
        >
          {status === "error" ? (
            <div className="p-4 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-bold text-red-600 dark:text-red-400">
                  Initialization Failed
                </p>
                <p className="mt-1">
                  Google Translate could not be loaded. Please check your
                  internet or disable ad-blockers.
                </p>
              </div>
              <Button
                onClick={() => {
                  initialized.current = false;
                  loadScript();
                }}
                variant="outline"
                size="sm"
                className="w-full text-[#368f8b] border-[#368f8b]/30 hover:bg-[#368f8b]/10"
              >
                <RefreshCcw className="w-3 h-3 mr-2" /> Retry Load
              </Button>
            </div>
          ) : (
            <>
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">
                Select Language
              </DropdownMenuLabel>
              <div className="p-1 max-h-72 overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-lg cursor-pointer transition-all ${
                      currentLang === lang.code
                        ? "bg-[#368f8b]/10 text-[#368f8b] dark:bg-[#368f8b]/20 dark:text-[#4ade80]"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i
                        className={`flag-icon flag-icon-${lang.flag} rounded-sm shadow-sm`}
                      />
                      <span className="font-medium">{lang.label}</span>
                    </div>
                    {currentLang === lang.code && (
                      <Check className="w-4 h-4 text-[#368f8b]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <style {...({ jsx: true, global: true } as any)}>{`
        /* Hide Google Translate original UI components */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-gadget-icon,
        iframe.goog-te-banner-frame,
        .goog-te-menu-value span:nth-child(2),
        .goog-te-menu-value img,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-tooltip:hover,
        .goog-te-balloon-frame {
          display: none !important;
        }
        
        /* Ensure body doesn't shift down */
        body {
          top: 0px !important;
          position: static !important;
        }

        /* Hide the container but keep it layout-active so Google script works */
        .google-translate-container {
          position: absolute !important;
          top: -1000px !important;
          left: -1000px !important;
          height: 1px !important;
          width: 1px !important;
          overflow: hidden !important;
          display: block !important;
          visibility: visible !important;
        }

        /* Specifically hide the default select box that Google injects */
        .goog-te-combo {
          display: none !important;
        }

        .goog-te-gadget {
          font-size: 0 !important;
          color: transparent !important;
        }

        /* Custom scrollbar for the dropdown */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default LanguagesDropdown;
