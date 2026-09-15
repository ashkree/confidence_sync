import { useState } from "react";
import type { Document } from "@/features/knowledge-base/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import {
  createColumnHelper,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import "@/components/ui/data-table-types";
import HeroSection from "@/components/sections/HeroSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  createDocument,
  deleteDocument,
  downloadDocument,
  viewDocument,
} from "@/features/knowledge-base/api";
import { formatDate } from "@/lib/date";

interface DocumentTableProps<TData extends Document> {
  columns?: ColumnDef<TData, unknown>[];
  data: TData[];
  title?: string;
}

// Page Components

function RowActions<TData extends Document>({ row }: { row: Row<TData> }) {
  const doc = row.original;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDocument(doc.id);
      await router.invalidate();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-10 sm:size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => viewDocument(doc.id)}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadDocument(doc.id)}>
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{doc.file_name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getBaseColumns<TData extends Document>(): ColumnDef<TData, unknown>[] {
  const helper = createColumnHelper<TData>();

  return [
    helper.accessor((row) => row.file_name, {
      id: "file_name",
      header: "File Name",
      cell: (info) => info.getValue(),
      meta: { mobile: "title" },
    }),
    helper.accessor((row) => formatDate(row.created_at), {
      id: "created_at",
      header: "Created",
      cell: (info) => info.getValue(),
      meta: { mobile: "field", mobileLabel: "Created" },
    }),
    helper.accessor((row) => formatDate(row.updated_at), {
      id: "updated_at",
      header: "Updated",
      cell: (info) => info.getValue(),
      meta: { mobile: "field", mobileLabel: "Updated" },
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => <RowActions row={props.row} />,
      meta: { mobile: "hidden" },
    }),
  ];
}

export function DocumentsPage<TData extends Document>({
  columns = [],
  data,
  title = "Documents",
}: DocumentTableProps<TData>) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <HeroSection title={title} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <PlusIcon /> Add Document{" "}
                </Button>
              }
            />
            <DialogContent>
              <DocumentUploadForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <DataTable
          columns={[...getBaseColumns<TData>(), ...columns]}
          data={data}
        />
      </div>
    </>
  );
}

// Document Upload Form

const formSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(50),
  attachment: z
    .instanceof(File, { message: "A file is required" })
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
      { message: "Only PDF files are allowed" },
    )
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    }),
});

interface DocumentUploadFormProps {
  onSuccess?: () => void;
}

function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { fileName: "", attachment: undefined as File | undefined },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.attachment) return;
      try {
        setSubmitError(null);
        await createDocument(value.attachment, value.fileName);
        await router.invalidate();
        form.reset();
        onSuccess?.();
      } catch {
        setSubmitError("Failed to upload document. Please try again.");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="attachment"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>File</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="file"
                  accept="application/pdf"
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.handleChange(file);
                    if (file) {
                      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                      form.setFieldValue("fileName", nameWithoutExt);
                    }
                  }}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="fileName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>File name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Document title"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        {submitError && (
          <Field>
            <p className="text-sm font-medium text-destructive">
              {submitError}
            </p>
          </Field>
        )}

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit} className="w-full">
              Upload Document
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
