"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, Eye, EyeOff, Shield } from "lucide-react";

interface PasswordConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  description: string;
}

export function PasswordConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: PasswordConfirmationDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPassword("");
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!password.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(password);
    } finally {
      setPassword("");
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && password.trim() && !isSubmitting) {
      e.preventDefault();
      handleConfirm();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 text-base leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Security Confirmation Required</p>
            <p className="mt-1">This action cannot be undone. Please verify your identity to continue.</p>
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-3">
          <Label 
            htmlFor="password-confirm" 
            className="text-sm font-medium text-gray-700 flex items-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>Enter your password</span>
          </Label>
          <div className="relative">
            <Input
              id="password-confirm"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your account password"
              className="pr-12 h-11 text-base"
              disabled={isSubmitting}
              autoFocus
              autoComplete="current-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
          {password.length > 0 && password.length < 6 && (
            <p className="text-sm text-amber-600 flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Password seems too short</span>
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!password.trim() || isSubmitting}
            className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Confirm Action</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}