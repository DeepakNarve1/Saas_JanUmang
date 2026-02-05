"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@app/components/ui/dialog";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { toast } from "react-toastify";
import { Copy, RefreshCw, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import {
  generateSecurePassword,
  copyToClipboard,
} from "@app/utils/passwordUtils";
import axios from "@app/utils/axios";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}) => {
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Generate password when dialog opens
  React.useEffect(() => {
    if (open && !temporaryPassword) {
      setTemporaryPassword(generateSecurePassword(12));
      setResetSuccess(false);
    }
  }, [open]);

  const handleGenerateNew = () => {
    setTemporaryPassword(generateSecurePassword(12));
    setResetSuccess(false);
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(temporaryPassword);
      toast.success("Password copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  const handleResetPassword = async () => {
    if (!temporaryPassword || temporaryPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setIsResetting(true);
      await axios.post(`/auth/users/${userId}/reset-password`, {
        temporaryPassword,
      });

      setResetSuccess(true);
      toast.success(
        `Password reset successfully for ${userName}. User must change password on next login.`,
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    setTemporaryPassword("");
    setShowPassword(false);
    setResetSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-[#202123] dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Reset User Password
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Generate a secure temporary password for <strong>{userName}</strong>{" "}
            ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Password Input */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium dark:text-gray-300"
            >
              Temporary Password
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={temporaryPassword}
                  onChange={(e) => {
                    setTemporaryPassword(e.target.value);
                    setResetSuccess(false);
                  }}
                  className="pr-10 font-mono dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Enter temporary password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateNew}
                title="Generate new password"
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy to clipboard"
                className="dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters with uppercase, lowercase,
              numbers, and symbols
            </p>
          </div>

          {/* Success Message */}
          {resetSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Password Reset Successful
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  The user will be required to change their password on next
                  login. Make sure to share this temporary password securely
                  with the user.
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          {!resetSuccess && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Important:</strong> Copy this password before
                closing. The user will need to change it on their next login.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            {resetSuccess ? "Close" : "Cancel"}
          </Button>
          {!resetSuccess && (
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting || !temporaryPassword}
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white"
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
