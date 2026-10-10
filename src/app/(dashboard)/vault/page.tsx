"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Upload, Trash2, FileText, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import {
  deleteVaultDocument,
  listVaultDocuments,
  uploadVaultDocument,
} from "@/lib/vault";
import type { DocumentType, VaultDocument } from "@/lib/types";

const DOC_TYPES: DocumentType[] = [
  "Resume",
  "Aadhaar",
  "Income Certificate",
  "Mark Sheet",
  "Passport",
  "Caste Certificate",
  "Other",
];

export default function VaultPage() {
  const { user, isDemo, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [uploadType, setUploadType] = useState<DocumentType>("Other");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const docs = await listVaultDocuments(user.uid, isDemo);
        if (!cancelled) setDocuments(docs);
      } catch {
        if (!cancelled) toast.error("Could not load vault documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isDemo, authLoading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const newDoc = await uploadVaultDocument(user.uid, isDemo, file, uploadType);
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success(
        isDemo
          ? `${file.name} saved locally (demo mode)`
          : `${file.name} uploaded to Firebase Storage`
      );
    } catch (err) {
      console.error(err);
      toast.error(
        "Upload failed. Enable Firestore + Storage in Firebase Console if using live auth."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (doc: VaultDocument) => {
    if (!user) return;
    try {
      await deleteVaultDocument(user.uid, isDemo, doc);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document removed");
    } catch {
      toast.error("Could not delete document");
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Document Vault"
          description={
            isDemo
              ? "Demo mode stores documents in this browser only. Sign in with Firebase for cloud vault."
              : "Documents upload to your private Firebase Storage folder and Firestore metadata."
          }
          action={
            <div className="flex items-center gap-2">
              <Select
                value={uploadType}
                onValueChange={(v) => v && setUploadType(v as DocumentType)}
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={uploading || !user}
                  onChange={handleUpload}
                />
                <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </span>
              </label>
            </div>
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="rounded-2xl border border-border bg-card shadow-sm shadow-slate-900/5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading vault…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.size}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(doc.uploadedAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {doc.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pending review
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </FadeIn>

      {!loading && documents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Your vault is empty. Upload documents to speed up applications.
          </p>
        </div>
      )}
    </div>
  );
}
