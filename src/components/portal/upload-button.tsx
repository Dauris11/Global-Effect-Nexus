"use client";

import { useState } from "react";
import { Upload, FileUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function UploadButton({ asignacionId, title }: { asignacionId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = () => {
    setLoading(true);
    // Simular subida de archivo
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast({
        title: "¡Entrega enviada!",
        description: `Tu archivo para "${title}" ha sido subido con éxito.`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-[#0a6a8a] px-4 py-2 text-[12.5px] font-bold text-white transition-transform hover:-translate-y-[2px]">
          <Upload className="h-3.5 w-3.5" />
          Subir entrega
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir entrega</DialogTitle>
          <DialogDescription>
            Sube el archivo correspondiente a la tarea: <strong>{title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <FileUp className="h-10 w-10 text-slate-400" />
          <div className="text-center">
            <p className="text-sm font-medium">Haz clic o arrastra un archivo aquí</p>
            <p className="text-xs text-slate-500">Soporta .pdf, .zip, .docx hasta 50MB</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            Seleccionar archivo
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={loading} className="bg-[#2096BA] hover:bg-[#0a6a8a]">
            {loading ? "Subiendo..." : "Enviar tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
