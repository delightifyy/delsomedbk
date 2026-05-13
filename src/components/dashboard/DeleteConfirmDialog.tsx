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

type DeleteConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export const DeleteConfirmDialog = ({
  open,
  title = "Delete this item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
    <AlertDialogContent className="w-[calc(100vw-1.5rem)] max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2 sm:space-x-0">
        <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={loading}
          className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {loading ? "Deleting..." : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
