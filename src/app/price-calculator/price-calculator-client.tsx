"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, ArrowUpDown, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DataTable } from "@/components/dashboard/data-table"
import { BulkUploadDialog } from "@/components/dashboard/bulk-upload-dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  addPriceCalculation,
  updatePriceCalculation,
  deletePriceCalculation,
  bulkDeletePriceCalculations,
  bulkUploadPriceCalculations,
  getProductByProductName,
  getSparePartByProductName,
  type CalcData,
} from "@/actions/price-calculator"

export type PriceCalculation = {
  id: string
  productName: string
  tagNo: string | null
  grade: string | null
  lotNumber: string | null
  make: string | null
  modelNumber: string | null
  cpu: string | null
  generation: string | null
  ramPresent: boolean
  ramCapacity: string | null
  hddPresent: boolean
  hdd: string | null
  ssdPresent: boolean
  ssd: string | null
  frontPanel: string
  panel: string
  screenNonTouch: string
  screenTouch: string
  hinge: string
  touchPad: string
  base: string
  keyboard: string
  battery: string
  frontPanelCost: number
  panelCost: number
  screenNonTouchCost: number
  screenTouchCost: number
  hingeCost: number
  touchPadCost: number
  baseCost: number
  keyboardCost: number
  batteryCost: number
  repairCost: number
  salePrice: number
  suggestedSalePrice: number
}

const COMPONENT_STATUSES = ["ok", "broken", "missing", "faulty"]

const COMPONENTS = [
  { id: "frontPanel", label: "Front Panel (Bazel)" },
  { id: "panel", label: "Panel" },
  { id: "screenNonTouch", label: "Screen Non-Touch" },
  { id: "screenTouch", label: "Screen Touch" },
  { id: "hinge", label: "Hinge" },
  { id: "touchPad", label: "Touch Pad" },
  { id: "base", label: "Base" },
  { id: "keyboard", label: "Keyboard" },
  { id: "battery", label: "Battery" },
]

type SparePartPrices = {
  frontPanel: number; panel: number; screenNonTouch: number; screenTouch: number;
  hinge: number; touchPad: number; base: number; keyboard: number; battery: number;
}

const defaultPrices: SparePartPrices = {
  frontPanel: 0, panel: 0, screenNonTouch: 0, screenTouch: 0,
  hinge: 0, touchPad: 0, base: 0, keyboard: 0, battery: 0,
}

type FormState = {
  productName: string
  tagNo: string; grade: string; lotNumber: string
  make: string; modelNumber: string; cpu: string; generation: string
  ramPresent: boolean; ramCapacity: string
  hddPresent: boolean; hdd: string
  ssdPresent: boolean; ssd: string
  frontPanel: string; panel: string; screenNonTouch: string; screenTouch: string
  hinge: string; touchPad: string; base: string; keyboard: string; battery: string
  salePrice: number
}

const defaultForm: FormState = {
  productName: "",
  tagNo: "", grade: "", lotNumber: "",
  make: "", modelNumber: "", cpu: "", generation: "",
  ramPresent: true, ramCapacity: "",
  hddPresent: true, hdd: "",
  ssdPresent: true, ssd: "",
  frontPanel: "ok", panel: "ok", screenNonTouch: "ok", screenTouch: "ok",
  hinge: "ok", touchPad: "ok", base: "ok", keyboard: "ok", battery: "ok",
  salePrice: 0,
}

function calcRepairCost(form: FormState, prices: SparePartPrices): number {
  return COMPONENTS.reduce((acc, comp) => {
    const status = form[comp.id as keyof FormState] as string
    if (status !== "ok") return acc + (prices[comp.id as keyof SparePartPrices] || 0)
    return acc
  }, 0)
}

const BULK_TEMPLATE_FIELDS = [
  "Product Name", "Tag No", "Grade", "LOT Number",
  "Make", "Model", "CPU", "Generation",
  "RAM", "RAM Capacity", "HDD", "HDD Capacity", "SSD", "SSD Capacity",
  "Front Panel(Bazel)", "Panel", "Screen", "Hinge", "Touch Pad", "Base", "Keyboard",
]

function FormContent({
  form, setForm, prices, setPrices, isFetching, onFetch, prefix,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  prices: SparePartPrices
  setPrices: React.Dispatch<React.SetStateAction<SparePartPrices>>
  isFetching: boolean
  onFetch: () => void
  prefix: string
}) {
  const repairCost = calcRepairCost(form, prices)
  const suggestedSalePrice = form.salePrice - repairCost

  return (
    <div className="grid gap-4 py-4">
      {/* Product Name — Primary Key */}
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-productName`} className="font-semibold text-sm">
          Product Name <span className="text-red-500">*</span>
          <span className="text-slate-400 font-normal ml-2 text-xs">(format: Make/Model/CPU/Generation)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id={`${prefix}-productName`}
            name="productName"
            value={form.productName}
            onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
            required
            placeholder="e.g. Dell/Latitude 5420/i5/11th"
            className="font-medium"
          />
          <Button type="button" onClick={onFetch} disabled={isFetching} variant="outline" className="shrink-0 gap-2">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Fetching..." : "Fetch"}
          </Button>
        </div>
      </div>

      {/* Identification */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-tagNo`}>Tag No</Label>
          <Input id={`${prefix}-tagNo`} name="tagNo" value={form.tagNo} onChange={e => setForm(f => ({ ...f, tagNo: e.target.value }))} placeholder="e.g. TAG001" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-grade`}>Grade</Label>
          <Input id={`${prefix}-grade`} name="grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-lotNumber`}>Lot Number</Label>
          <Input id={`${prefix}-lotNumber`} name="lotNumber" value={form.lotNumber} onChange={e => setForm(f => ({ ...f, lotNumber: e.target.value }))} placeholder="e.g. LOT-001" />
        </div>
      </div>

      {/* Auto-filled from Product Master */}
      <div className="grid grid-cols-4 gap-4 bg-slate-50 rounded-lg p-3 border">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Make (auto)</Label>
          <Input name="make" value={form.make} readOnly className="bg-white text-sm" placeholder="Auto-fetched" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Model Number (auto)</Label>
          <Input name="modelNumber" value={form.modelNumber} readOnly className="bg-white text-sm" placeholder="Auto-fetched" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">CPU (auto)</Label>
          <Input name="cpu" value={form.cpu} readOnly className="bg-white text-sm" placeholder="Auto-fetched" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Generation (auto)</Label>
          <Input name="generation" value={form.generation} readOnly className="bg-white text-sm" placeholder="Auto-fetched" />
        </div>
      </div>

      {/* RAM / HDD / SSD */}
      <div className="grid grid-cols-3 gap-4 bg-muted/30 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>RAM Present</Label>
            <Switch checked={form.ramPresent} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, ramPresent: v }))} />
          </div>
          <Input name="ramCapacity" value={form.ramCapacity} readOnly className="bg-muted" placeholder="Auto-fetched" />
          <input type="hidden" name="ramPresent" value={String(form.ramPresent)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>HDD Present</Label>
            <Switch checked={form.hddPresent} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, hddPresent: v }))} />
          </div>
          <Input name="hdd" value={form.hdd} readOnly className="bg-muted" placeholder="Auto-fetched" />
          <input type="hidden" name="hddPresent" value={String(form.hddPresent)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>SSD Present</Label>
            <Switch checked={form.ssdPresent} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, ssdPresent: v }))} />
          </div>
          <Input name="ssd" value={form.ssd} readOnly className="bg-muted" placeholder="Auto-fetched" />
          <input type="hidden" name="ssdPresent" value={String(form.ssdPresent)} />
        </div>
      </div>

      {/* Component Statuses */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Component Condition</h3>
        <div className="grid grid-cols-3 gap-3">
          {COMPONENTS.map(comp => (
            <div key={comp.id} className="space-y-1">
              <Label className="text-xs">{comp.label}</Label>
              <Select
                value={form[comp.id as keyof FormState] as string}
                onValueChange={v => setForm(f => ({ ...f, [comp.id]: v }))}
              >
                <SelectTrigger className={form[comp.id as keyof FormState] !== "ok" ? "border-red-400 text-red-600" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name={comp.id} value={form[comp.id as keyof FormState] as string} />
              {form[comp.id as keyof FormState] !== "ok" && (
                <p className="text-xs text-red-500">+ ₹{prices[comp.id as keyof SparePartPrices] || 0}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t">
        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
          <Label className="text-red-500 text-xs">Repair Cost</Label>
          <div className="text-xl font-black text-red-700">₹{repairCost.toLocaleString()}</div>
          <input type="hidden" name="repairCost" value={repairCost} />
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Label className="text-blue-500 text-xs">Sale Price</Label>
          <div className="text-xl font-black text-blue-700">₹{form.salePrice.toLocaleString()}</div>
          <input type="hidden" name="salePrice" value={form.salePrice} />
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <Label className="text-green-500 text-xs">Suggested Sale Price</Label>
          <div className="text-xl font-black text-green-700">₹{suggestedSalePrice.toLocaleString()}</div>
          <input type="hidden" name="suggestedSalePrice" value={suggestedSalePrice} />
        </div>
      </div>
    </div>
  )
}

export function PriceCalculatorClient({ initialCalculations }: { initialCalculations: PriceCalculation[] }) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [selectedCalc, setSelectedCalc] = useState<PriceCalculation | null>(null)
  const [selectedForBulk, setSelectedForBulk] = useState<PriceCalculation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [addForm, setAddForm] = useState<FormState>(defaultForm)
  const [addPrices, setAddPrices] = useState<SparePartPrices>(defaultPrices)
  const [editForm, setEditForm] = useState<FormState>(defaultForm)
  const [editPrices, setEditPrices] = useState<SparePartPrices>(defaultPrices)

  useEffect(() => {
    if (selectedCalc) {
      setEditForm({
        productName: selectedCalc.productName,
        tagNo: selectedCalc.tagNo || "",
        grade: selectedCalc.grade || "",
        lotNumber: selectedCalc.lotNumber || "",
        make: selectedCalc.make || "",
        modelNumber: selectedCalc.modelNumber || "",
        cpu: selectedCalc.cpu || "",
        generation: selectedCalc.generation || "",
        ramPresent: selectedCalc.ramPresent,
        ramCapacity: selectedCalc.ramCapacity || "",
        hddPresent: selectedCalc.hddPresent,
        hdd: selectedCalc.hdd || "",
        ssdPresent: selectedCalc.ssdPresent,
        ssd: selectedCalc.ssd || "",
        frontPanel: selectedCalc.frontPanel,
        panel: selectedCalc.panel,
        screenNonTouch: selectedCalc.screenNonTouch,
        screenTouch: selectedCalc.screenTouch,
        hinge: selectedCalc.hinge,
        touchPad: selectedCalc.touchPad,
        base: selectedCalc.base,
        keyboard: selectedCalc.keyboard,
        battery: selectedCalc.battery,
        salePrice: selectedCalc.salePrice,
      })
    }
  }, [selectedCalc])

  const handleFetch = async (
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>,
    setPrices: React.Dispatch<React.SetStateAction<SparePartPrices>>
  ) => {
    if (!form.productName) {
      toast.error("Product Name is required to fetch details")
      return
    }
    setIsFetching(true)
    const [productResult, spareResult] = await Promise.all([
      getProductByProductName(form.productName),
      getSparePartByProductName(form.productName),
    ])
    setIsFetching(false)

    if (productResult.success && productResult.data) {
      setForm(f => ({
        ...f,
        make: productResult.data.make || "",
        modelNumber: productResult.data.modelNumber || "",
        cpu: productResult.data.cpu || "",
        generation: productResult.data.generation || "",
        ramCapacity: productResult.data.ram || "",
        hdd: productResult.data.hdd || "",
        ssd: productResult.data.ssd || "",
        salePrice: productResult.data.salePrice,
      }))
      toast.success("Product details fetched from Product Master")
    } else {
      toast.warning("Product not found in Product Master")
    }

    if (spareResult.success && spareResult.data) {
      setPrices(spareResult.data)
      toast.success("Spare part prices fetched")
    } else {
      toast.warning("Spare parts not found in Spare Parts Master")
    }
  }

  const buildCalcData = (form: FormState, prices: SparePartPrices): CalcData => {
    const statusMap: Record<string, number> = {}
    COMPONENTS.forEach(comp => {
      const status = form[comp.id as keyof FormState] as string
      statusMap[comp.id] = status !== "ok" ? (prices[comp.id as keyof SparePartPrices] || 0) : 0
    })

    const repairCost = Object.values(statusMap).reduce((a, b) => a + b, 0)
    const suggestedSalePrice = form.salePrice - repairCost
    return {
      productName: form.productName,
      tagNo: form.tagNo || null,
      grade: form.grade || null,
      lotNumber: form.lotNumber || null,
      make: form.make || null,
      modelNumber: form.modelNumber || null,
      cpu: form.cpu || null,
      generation: form.generation || null,
      ramPresent: form.ramPresent,
      ramCapacity: form.ramCapacity || null,
      hddPresent: form.hddPresent,
      hdd: form.hdd || null,
      ssdPresent: form.ssdPresent,
      ssd: form.ssd || null,
      frontPanel: form.frontPanel,
      frontPanelCost: statusMap.frontPanel,
      panel: form.panel,
      panelCost: statusMap.panel,
      screenNonTouch: form.screenNonTouch,
      screenNonTouchCost: statusMap.screenNonTouch,
      screenTouch: form.screenTouch,
      screenTouchCost: statusMap.screenTouch,
      hinge: form.hinge,
      hingeCost: statusMap.hinge,
      touchPad: form.touchPad,
      touchPadCost: statusMap.touchPad,
      base: form.base,
      baseCost: statusMap.base,
      keyboard: form.keyboard,
      keyboardCost: statusMap.keyboard,
      battery: form.battery,
      batteryCost: statusMap.battery,
      repairCost,
      salePrice: form.salePrice,
      suggestedSalePrice,
    }
  }

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!addForm.productName) {
      toast.error("Product Name is required")
      return
    }
    setIsLoading(true)
    const result = await addPriceCalculation(buildCalcData(addForm, addPrices))
    setIsLoading(false)
    if (result.success) {
      setIsAddDialogOpen(false)
      setAddForm(defaultForm)
      setAddPrices(defaultPrices)
      router.refresh()
      toast.success("Calculation added successfully")
    } else {
      toast.error(result.error || "Failed to add calculation")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCalc) return
    if (!editForm.productName) {
      toast.error("Product Name is required")
      return
    }
    setIsLoading(true)
    const result = await updatePriceCalculation(selectedCalc.id, buildCalcData(editForm, editPrices))
    setIsLoading(false)
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedCalc(null)
      router.refresh()
      toast.success("Calculation updated successfully")
    } else {
      toast.error(result.error || "Failed to update calculation")
    }
  }

  const handleDelete = async () => {
    if (!selectedCalc) return
    setIsDeleting(true)
    const result = await deletePriceCalculation(selectedCalc.id)
    setIsDeleting(false)
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setSelectedCalc(null)
      router.refresh()
      toast.success("Calculation deleted")
    } else {
      toast.error(result.error || "Failed to delete")
    }
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    const result = await bulkDeletePriceCalculations(selectedForBulk.map(c => c.id))
    setIsDeleting(false)
    if (result.success) {
      setIsBulkDeleteDialogOpen(false)
      setSelectedForBulk([])
      router.refresh()
      toast.success(`Deleted ${selectedForBulk.length} calculations`)
    } else {
      toast.error(result.error || "Failed to delete")
    }
  }

  const handleExport = () => {
    const exportData = initialCalculations.map((c, i) => ({
      "S.No": i + 1,
      "Product Name": c.productName,
      "Tag No": c.tagNo || "-",
      "Grade": c.grade || "-",
      "Lot Number": c.lotNumber || "-",
      "Make": c.make || "-",
      "Model Number": c.modelNumber || "-",
      "CPU": c.cpu || "-",
      "Generation": c.generation || "-",
      "RAM": c.ramPresent ? "Yes" : "No",
      "RAM (Excel)": (c as any).excelRamCapacity || "-",
      "RAM (PM)": c.ramCapacity || "-",
      "HDD": c.hddPresent ? "Yes" : "No",
      "HDD (Excel)": (c as any).excelHdd || "-",
      "HDD (PM)": c.hdd || "-",
      "SSD": c.ssdPresent ? "Yes" : "No",
      "SSD (Excel)": (c as any).excelSsd || "-",
      "SSD (PM)": c.ssd || "-",
      "Front Panel": c.frontPanelCost,
      "Panel": c.panelCost,
      "Screen Non-Touch": c.screenNonTouchCost,
      "Screen Touch": c.screenTouchCost,
      "Hinge": c.hingeCost,
      "Touch Pad": c.touchPadCost,
      "Base": c.baseCost,
      "Keyboard": c.keyboardCost,
      "Battery": c.batteryCost,
      "Repair Cost": c.repairCost,
      "Sale Price": c.salePrice,
      "Suggested Sale Price": c.suggestedSalePrice,
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Price Calculations")
    XLSX.writeFile(wb, `PriceCalculations_${new Date().toISOString().split("T")[0]}.xlsx`)
    toast.success("Exported successfully")
  }

  const columns: ColumnDef<PriceCalculation>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" className="translate-y-[2px] h-4 w-4 border-slate-400 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} aria-label="Select row" className="translate-y-[2px] h-4 w-4 border-slate-400 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { id: "sno", header: "S.No", cell: ({ row }) => <div>{row.index + 1}</div> },
    {
      accessorKey: "productName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Product Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("productName")}</span>,
    },
    { accessorKey: "make", header: "Make", cell: ({ row }) => row.getValue("make") || "-" },
    { accessorKey: "modelNumber", header: "Model", cell: ({ row }) => row.getValue("modelNumber") || "-" },
    { accessorKey: "cpu", header: "CPU", cell: ({ row }) => row.getValue("cpu") || "-" },
    { accessorKey: "generation", header: "Gen", cell: ({ row }) => row.getValue("generation") || "-" },
    { accessorKey: "tagNo", header: "Tag No", cell: ({ row }) => row.getValue("tagNo") || "-" },
    { accessorKey: "grade", header: "Grade", cell: ({ row }) => row.getValue("grade") || "-" },
    { accessorKey: "lotNumber", header: "Lot No", cell: ({ row }) => row.getValue("lotNumber") || "-" },
    // NOTE: RAM/HDD/SSD columns moved to after Repair Cost (Excel vs Product Master values)
    { 
      accessorKey: "frontPanelCost", 
      header: "Front Panel", 
      cell: ({ row }) => (
        <span className={row.original.frontPanel?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.frontPanel?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.frontPanelCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "panelCost", 
      header: "Panel", 
      cell: ({ row }) => (
        <span className={row.original.panel?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.panel?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.panelCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "screenNonTouchCost", 
      header: "Screen NT", 
      cell: ({ row }) => (
        <span className={row.original.screenNonTouch?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.screenNonTouch?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.screenNonTouchCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "screenTouchCost", 
      header: "Screen T", 
      cell: ({ row }) => (
        <span className={row.original.screenTouch?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.screenTouch?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.screenTouchCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "hingeCost", 
      header: "Hinge", 
      cell: ({ row }) => (
        <span className={row.original.hinge?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.hinge?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.hingeCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "touchPadCost", 
      header: "Touch Pad", 
      cell: ({ row }) => (
        <span className={row.original.touchPad?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.touchPad?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.touchPadCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "baseCost", 
      header: "Base", 
      cell: ({ row }) => (
        <span className={row.original.base?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.base?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.baseCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "keyboardCost", 
      header: "Keyboard", 
      cell: ({ row }) => (
        <span className={row.original.keyboard?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.keyboard?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.keyboardCost.toLocaleString()}`}
        </span>
      )
    },
    { 
      accessorKey: "batteryCost", 
      header: "Battery", 
      cell: ({ row }) => (
        <span className={row.original.battery?.toLowerCase().trim() !== "ok" ? "text-red-500 font-medium" : ""}>
          {row.original.battery?.toLowerCase().trim() === "ok" ? "0" : `₹${row.original.batteryCost.toLocaleString()}`}
        </span>
      )
    },
    { accessorKey: "repairCost", header: "Repair Cost", cell: ({ row }) => `₹${(row.getValue("repairCost") as number).toLocaleString()}` },
    // RAM/HDD/SSD presence and capacities: Excel value then Product Master (PM) value
    {
      id: "ramValue",
      header: "RAM",
      cell: ({ row }) => (row.original.ramPresent ? "Yes" : "No"),
    },
    {
      id: "excelRamCap",
      header: "RAM (Excel)",
      cell: ({ row }) => (row.original as any).excelRamCapacity ? String((row.original as any).excelRamCapacity) : "-",
    },
    {
      id: "pmRamCap",
      header: "RAM (PM)",
      cell: ({ row }) => row.original.ramCapacity || "-",
    },
    {
      id: "hddValue",
      header: "HDD",
      cell: ({ row }) => (row.original.hddPresent ? "Yes" : "No"),
    },
    {
      id: "excelHddCap",
      header: "HDD (Excel)",
      cell: ({ row }) => (row.original as any).excelHdd ? String((row.original as any).excelHdd) : "-",
    },
    {
      id: "pmHddCap",
      header: "HDD (PM)",
      cell: ({ row }) => row.original.hdd || "-",
    },
    {
      id: "ssdValue",
      header: "SSD",
      cell: ({ row }) => (row.original.ssdPresent ? "Yes" : "No"),
    },
    {
      id: "excelSsdCap",
      header: "SSD (Excel)",
      cell: ({ row }) => (row.original as any).excelSsd ? String((row.original as any).excelSsd) : "-",
    },
    {
      id: "pmSsdCap",
      header: "SSD (PM)",
      cell: ({ row }) => row.original.ssd || "-",
    },
    { accessorKey: "salePrice", header: "Sale Price", cell: ({ row }) => `₹${(row.getValue("salePrice") as number).toLocaleString()}` },
    { accessorKey: "suggestedSalePrice", header: "Suggested Price", cell: ({ row }) => <span className="font-bold text-green-600">₹{(row.getValue("suggestedSalePrice") as number).toLocaleString()}</span> },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setSelectedCalc(row.original); setIsEditDialogOpen(true) }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setSelectedCalc(row.original); setIsDeleteDialogOpen(true) }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="py-2 px-1 sm:px-0">
      <DataTable
        columns={columns}
        data={initialCalculations}
        title="Price Calculator"
        onAdd={() => setIsAddDialogOpen(true)}
        onBulkDelete={(items) => { setSelectedForBulk(items); setIsBulkDeleteDialogOpen(true) }}
        onExport={handleExport}
        actions={
          <BulkUploadDialog
            title="Price Calculations"
            templateFields={BULK_TEMPLATE_FIELDS}
            onUpload={bulkUploadPriceCalculations}
          />
        }
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Price Calculation</DialogTitle>
              <DialogDescription>Enter the Product Name and click Fetch to auto-fill details from masters.</DialogDescription>
            </DialogHeader>
            <FormContent
              form={addForm} setForm={setAddForm}
              prices={addPrices} setPrices={setAddPrices}
              isFetching={isFetching}
              onFetch={() => handleFetch(addForm, setAddForm, setAddPrices)}
              prefix="add"
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Adding..." : "Add Calculation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Price Calculation</DialogTitle>
              <DialogDescription>Update the details for this calculation.</DialogDescription>
            </DialogHeader>
            <FormContent
              form={editForm} setForm={setEditForm}
              prices={editPrices} setPrices={setEditPrices}
              isFetching={isFetching}
              onFetch={() => handleFetch(editForm, setEditForm, setEditPrices)}
              prefix="edit"
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Calculation"
        description={`Are you sure you want to delete this calculation for ${selectedCalc?.productName}?`}
        loading={isDeleting}
      />

      <DeleteConfirmDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Calculations"
        description={`Are you sure you want to delete ${selectedForBulk.length} calculations?`}
        loading={isDeleting}
      />
    </div>
  )
}
