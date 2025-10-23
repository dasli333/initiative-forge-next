// Dialog warning about unsaved changes

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onSaveAndLeave,
  onLeaveWithoutSaving,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes to your combat. Do you want to save before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onLeaveWithoutSaving} className="bg-destructive hover:bg-destructive/90">
            Leave without saving
          </AlertDialogAction>
          <AlertDialogAction onClick={onSaveAndLeave} className="bg-emerald-600 hover:bg-emerald-700">
            Save & Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
