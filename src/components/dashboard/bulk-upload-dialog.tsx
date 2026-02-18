"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileDown, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

interface BulkUploadDialogProps {
  onUpload: (data: Record<string, unknown>[]) => Promise<{ success: boolean; count?: number; error?: string }>
  title: string
  templateFields: string[]
}

export function BulkUploadDialog({ onUpload, title, templateFields }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const resetState = () => {
    setFile(null)
    setPreview(null)
    setStatus(null)
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetState()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  const parseFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
        if (data.length > 0) {
          setPreview(data.slice(0, 5)) // Show first 5 rows
          setStatus(null)
        } else {
          setPreview(null)
          setStatus({ type: "error", message: "No valid data found in file" })
        }
      } catch (error) {
        console.error("Parse Error:", error)
        setPreview(null)
        setStatus({ type: "error", message: "Error parsing file" })
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleUpload = async () => {
    if (!file || !preview) return
    setIsLoading(true)
    setStatus(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const bstr = e.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        
        // Sanitize data to ensure only plain objects are passed to the Server Action
        const plainData = JSON.parse(JSON.stringify(data))

        const result = await onUpload(plainData)
        if (result.success) {
          toast.success(`Successfully imported ${result.count} items!`)
          setStatus({ type: "success", message: `Successfully uploaded ${result.count} items!` })
          setTimeout(() => {
            handleOpenChange(false)
          }, 1500)
        } else {
          toast.error(result.error || "Import failed")
          setStatus({ type: "error", message: result.error || "Failed to upload data" })
        }
      } catch (error) {
        console.error("Upload Error:", error)
        toast.error("Error parsing file. Please check the format.")
        setStatus({ type: "error", message: "Error parsing file. Please check the format." })
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      Object.fromEntries(templateFields.map(field => [field, ""]))
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}_Template.xlsx`)
  }

  const steps = [
    { title: "Configuration", description: "Download template & setup" },
    { title: "Upload File", description: "Select your Excel/CSV" },
    { title: "Review Data", description: "Validate imported rows" },
  ]

  const currentStep = !file ? 0 : (!preview ? 1 : 2)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all font-semibold shadow-sm rounded-lg h-9">
          <Upload className="h-4 w-4" /> Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] p-0 overflow-hidden border border-slate-200 shadow-xl rounded-xl bg-white">
        <div className="flex flex-col sm:flex-row h-[600px] w-full items-stretch">
          {/* Left Sidebar - Progress */}
          <div className="w-full sm:w-64 bg-slate-50 p-8 flex flex-col justify-between border-r border-slate-200 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-10">
                <div className="bg-blue-600 rounded-md p-1.5">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Bulk Import</h2>
              </div>

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className={`flex gap-3 items-center transition-all duration-300 ${currentStep === i ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${currentStep === i ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold leading-none ${currentStep === i ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Storage Ready</span>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-white overflow-hidden min-h-0 min-w-0 h-full max-h-full">
            {/* Header */}
            <div className="p-8 pb-4 shrink-0 border-b border-slate-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Import {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium">
                  Follow the standard process to populate your inventory.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-8 py-6 custom-scrollbar min-h-0 w-full">
              <div className="space-y-8">
                {/* Step Content: Configuration */}
                {currentStep === 0 && (
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 text-slate-900">
                      <FileDown className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wide">1. Download Template</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Please use our standardized format to ensure your data is processed correctly without errors.
                    </p>
                    <Button 
                      onClick={downloadTemplate} 
                      variant="outline"
                      className="bg-white border-slate-200 text-slate-900 hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 font-bold text-xs"
                    >
                      <FileDown className="h-4 w-4" /> Get Template File
                    </Button>
                  </div>
                )}

                {/* Step Content: Upload */}
                {(currentStep === 1 || currentStep === 0) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <Upload className="h-4 w-4 text-blue-600" /> 2. Select Source File
                    </h3>
                    
                    <div className={`
                      relative group border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                      ${file ? 'border-green-500/50 bg-green-50/20' : 'border-slate-200 hover:border-blue-500 bg-white'}
                    `}>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <Upload className={`h-6 w-6 ${file ? 'text-green-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                        {file ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900">{file.name}</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Verified & Ready</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-700">Click to browse or drag file here</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">XLSX or CSV Format</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Content: Review */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> 3. Review Sample Data
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                              {Object.keys(preview![0]).map((key) => (
                                <th key={key} className="px-6 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {preview!.map((row, i) => {
                              const keys = Object.keys(preview![0]);
                              const findValue = (item: Record<string, unknown>, target: string) => {
                                const normalizedTarget = target.toLowerCase().replace(/\s+/g, '');
                                for (const key in item) {
                                  if (key.toLowerCase().replace(/\s+/g, '') === normalizedTarget) return item[key];
                                }
                                return undefined;
                              };

                              const isValid = !!findValue(row, 'productName');

                              return (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-6 py-3 border-r border-slate-100 text-[10px] font-bold uppercase whitespace-nowrap sticky left-0 bg-white z-10">
                                    {isValid ? (
                                      <span className="text-green-600 font-bold">VALID</span>
                                    ) : (
                                      <span className="text-red-500 font-bold">MISSING DATA</span>
                                    )}
                                  </td>
                                  {keys.map((key, j) => (
                                    <td key={j} className="px-6 py-3 whitespace-nowrap">{String(row[key] ?? "")}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Showing {preview?.length} reference rows</p>
                      </div>
                    </div>
                  </div>
                )}

                {status && (
                  <div className={`
                    p-4 rounded-xl flex items-start gap-4 border
                    ${status.type === "success" ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}
                  `}>
                    <div className={`p-1.5 rounded-lg h-fit ${status.type === "success" ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {status.type === "success" ? 'Import Success' : 'Import Error'}
                        </p>
                        {status.type === "error" && (
                          <button 
                            onClick={resetState}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" /> Clear & Reset
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-tight">
                        {status.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
              <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)} 
                className="text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isLoading}
                className={`
                  px-8 h-10 rounded-lg font-bold text-xs uppercase tracking-widest transition-all
                  ${file && !isLoading 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                     <RefreshCw className="h-4 w-4 animate-spin" /> Processing...
                  </div>
                ) : (
                  "Start Import"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
