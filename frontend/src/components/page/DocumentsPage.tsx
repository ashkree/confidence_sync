import type { Document } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createColumnHelper,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import HeroSection from "@/components/sections/HeroSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface DocumentTableProps<TData extends Document> {
  columns?: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
}

// Page Components

function RowActions({ row }: { row: Row<Document> }) {
  const doc = row.original;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(doc.url, "_blank")}>
          View
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getBaseColumns<TData extends Document>(): ColumnDef<TData, any>[] {
  const helper = createColumnHelper<TData>();

  return [
    helper.accessor("title" as any, {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("created_at" as any, {
      header: "Created",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("updated_at" as any, {
      header: "Updated",
      cell: (info) => info.getValue(),
    }),
    helper.display({
      id: "actions",
      header: "Actions",

      cell: (props) => <RowActions row={props.row} />,
    }),
  ];
}

export function DocumentsPage<TData extends Document>({
  columns = [],
  data,
  title = "Documents",
}: DocumentTableProps<TData>) {
  return (
    <>
      <HeroSection title={title} />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger
              render={
                <Button>
                  <PlusIcon /> Add Document{" "}
                </Button>
              }
            />
            <DialogContent>
              <DocumentUploadForm />
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
  fileName: z.string().min(1, "File name is required"),
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

function DocumentUploadForm() {
  const form = useForm({
    defaultValues: { fileName: "", attachment: undefined as File | undefined },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      console.log(value);
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
                  onChange={(e) => field.handleChange(e.target.files?.[0])}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

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
