import { Loader2 } from "lucide-react";

export const OverlayLoading = ({
  type = "light",
}: {
  type?: "dark" | "light";
}) => {
  return (
    <div className={`overlay ${type}`}>
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
};
