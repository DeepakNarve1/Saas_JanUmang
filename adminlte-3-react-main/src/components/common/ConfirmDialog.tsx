import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@app/components/ui/alert-dialog";

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  trigger?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmDialog = ({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your data and remove it from our servers.",
  onConfirm,
  trigger,
  isOpen,
  onOpenChange,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="dark:bg-card dark:border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-gray-100">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
              if (onOpenChange) onOpenChange(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600/90 dark:hover:bg-red-600"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
