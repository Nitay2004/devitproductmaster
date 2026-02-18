"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, ArrowUpDown, Pencil } from "lucide-react"
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

import { addSparePart, updateSparePart, deleteSparePart, bulkDeleteSpareParts } from "@/actions/spare-parts"
import { bulkUploadSpareParts } from "@/actions/bulk-upload"
import { DataTable } from "@/components/dashboard/data-table"
import { BulkUploadDialog } from "@/components/dashboard/bulk-upload-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import * as XLSX from "xlsx"

export type SparePart = {
  id: string
  make: string
  modelNumber: string
  cpu: string | null
  generation: string | null
  productName: string | null
  frontPanel: number | null
  panel: number | null
  screenNonTouch: number | null
  screenTouch: number | null
  hinge: number | null
  touchPad: number | null
  base: number | null
  keyboard: number | null
  battery: number | null
}

export function SparePartsClient({ initialSpareParts }: { initialSpareParts: SparePart[] }) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [selectedPartsForBulk, setSelectedPartsForBulk] = useState<SparePart[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State for Add Spare Part Form
  const [addFormData, setAddFormData] = useState({
    make: "",
    modelNumber: "",
    cpu: "",
    generation: "",
  })

  // State for Edit Spare Part Form
  const [editFormData, setEditFormData] = useState({
    make: "",
    modelNumber: "",
    cpu: "",
    generation: "",
  })

  // Derived Product Name for Add Form
  const addProductName = [
    addFormData.make,
    addFormData.modelNumber,
    addFormData.cpu,
    addFormData.generation
  ].filter(Boolean).join("/")

  // Derived Product Name for Edit Form
  const editProductName = [
    editFormData.make,
    editFormData.modelNumber,
    editFormData.cpu,
    editFormData.generation
  ].filter(Boolean).join("/")

  useEffect(() => {
    if (selectedSparePart) {
      setEditFormData({
        make: selectedSparePart.make,
        modelNumber: selectedSparePart.modelNumber,
        cpu: selectedSparePart.cpu || "",
        generation: selectedSparePart.generation || "",
      })
    }
  }, [selectedSparePart])

  const columns: ColumnDef<SparePart>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] h-4 w-4 border-slate-400 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] h-4 w-4 border-slate-400 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
        id: "sno",
        header: "S.No",
        cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "make",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Make <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "modelNumber",
      header: "Model Number",
    },
    {
        accessorKey: "cpu",
        header: "CPU",
    },
    {
        accessorKey: "generation",
        header: "Generation",
    },
    {
        accessorKey: "productName",
        header: "Product Name",
    },
    {
        accessorKey: "frontPanel",
        header: "Front Panel",
        cell: ({ row }) => row.getValue("frontPanel") ? `₹${row.getValue("frontPanel")}` : "-",
    },
    {
        accessorKey: "panel",
        header: "Panel",
        cell: ({ row }) => row.getValue("panel") ? `₹${row.getValue("panel")}` : "-",
    },
    {
        accessorKey: "screenNonTouch",
        header: "Screen Non Touch",
        cell: ({ row }) => row.getValue("screenNonTouch") ? `₹${row.getValue("screenNonTouch")}` : "-",
    },
    {
        accessorKey: "screenTouch",
        header: "Screen Touch",
        cell: ({ row }) => row.getValue("screenTouch") ? `₹${row.getValue("screenTouch")}` : "-",
    },
    {
        accessorKey: "hinge",
        header: "Hinge",
        cell: ({ row }) => row.getValue("hinge") ? `₹${row.getValue("hinge")}` : "-",
    },
    {
        accessorKey: "touchPad",
        header: "Touch Pad",
        cell: ({ row }) => row.getValue("touchPad") ? `₹${row.getValue("touchPad")}` : "-",
    },
    {
        accessorKey: "base",
        header: "Base",
        cell: ({ row }) => row.getValue("base") ? `₹${row.getValue("base")}` : "-",
    },
    {
        accessorKey: "keyboard",
        header: "Keyboard",
        cell: ({ row }) => row.getValue("keyboard") ? `₹${row.getValue("keyboard")}` : "-",
    },
    {
        accessorKey: "battery",
        header: "Battery",
        cell: ({ row }) => row.getValue("battery") ? `₹${row.getValue("battery")}` : "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSparePart(row.original)
              setIsEditDialogOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSparePart(row.original)
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddFormData({
      ...addFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    })
  }

  async function onAddSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    // Ensure product name is set from our derived state
    formData.set("productName", addProductName)
    
    const result = await addSparePart(formData)
    setIsLoading(false)

    if (result.success) {
      setIsAddDialogOpen(false)
      setAddFormData({ make: "", modelNumber: "", cpu: "", generation: "" }) // Reset form
      router.refresh()
      toast.success("Spare part added successfully")
    } else {
      toast.error(result.error || "Failed to add spare part")
    }
  }

  async function onEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedSparePart) return
    
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    // Ensure product name is set from our derived state
    formData.set("productName", editProductName)
    
    const result = await updateSparePart(selectedSparePart.id, formData)
    setIsLoading(false)

    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedSparePart(null)
      router.refresh()
      toast.success("Spare part updated successfully")
    } else {
      toast.error(result.error || "Failed to update spare part")
    }
  }

  const handleDeletePart = async () => {
    if (!selectedSparePart) return
    setIsDeleting(true)
    const result = await deleteSparePart(selectedSparePart.id)
    setIsDeleting(false)
    
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setSelectedSparePart(null)
      toast.success("Spare part deleted successfully")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete spare part")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPartsForBulk.length === 0) return
    setIsDeleting(true)
    const ids = selectedPartsForBulk.map(p => p.id)
    const result = await bulkDeleteSpareParts(ids)
    setIsDeleting(false)
    
    if (result.success) {
      setIsBulkDeleteDialogOpen(false)
      setSelectedPartsForBulk([])
      toast.success(`Successfully deleted ${ids.length} spare parts`)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete spare parts")
    }
  }

  const handleExport = () => {
    try {
      const exportData = initialSpareParts.map((p, index) => ({
        "S.No": index + 1,
        "Make": p.make,
        "Model Number": p.modelNumber,
        "CPU": p.cpu || "-",
        "Generation": p.generation || "-",
        "Product Name": p.productName || "-",
        "Front Panel": p.frontPanel || 0,
        "Panel": p.panel || 0,
        "Screen Non-Touch": p.screenNonTouch || 0,
        "Screen Touch": p.screenTouch || 0,
        "Hinge": p.hinge || 0,
        "Touch Pad": p.touchPad || 0,
        "Base": p.base || 0,
        "Keyboard": p.keyboard || 0,
        "Battery": p.battery || 0
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Spare Parts");
      XLSX.writeFile(wb, `SpareParts_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Spare parts exported successfully");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export spare parts");
    }
  };

  return (
    <div className="py-2 px-1 sm:px-0">
      <DataTable 
        columns={columns} 
        data={initialSpareParts} 
        title="Spare Parts" 
        onAdd={() => setIsAddDialogOpen(true)} 
        onBulkDelete={(parts) => {
          setSelectedPartsForBulk(parts)
          setIsBulkDeleteDialogOpen(true)
        }}
        onExport={handleExport}
        actions={
          <BulkUploadDialog 
            title="Spare Parts" 
            onUpload={bulkUploadSpareParts} 
            templateFields={["make", "modelNumber", "cpu", "generation", "productName", "frontPanel", "panel", "screenNonTouch", "screenTouch", "hinge", "touchPad", "base", "keyboard", "battery"]}
          />
        }
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={onAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Spare Part</DialogTitle>
              <DialogDescription>
                Enter the details of the laptop and its component prices.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input 
                    id="make" 
                    name="make" 
                    placeholder="e.g. Dell" 
                    required 
                    pattern="^(?!\d+$).+" 
                    title="Make cannot be only numbers"
                    value={addFormData.make}
                    onChange={handleAddChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input 
                    id="modelNumber" 
                    name="modelNumber" 
                    placeholder="e.g. XPS 13" 
                    required 
                    pattern="^(?!\d+$).+" 
                    title="Model Number cannot be only numbers"
                    value={addFormData.modelNumber}
                    onChange={handleAddChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">CPU</Label>
                  <Input 
                    id="cpu" 
                    name="cpu" 
                    placeholder="e.g. i7"
                    value={addFormData.cpu}
                    onChange={handleAddChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generation">Generation</Label>
                  <Input 
                    id="generation" 
                    name="generation" 
                    placeholder="e.g. 11th Gen"
                    value={addFormData.generation}
                    onChange={handleAddChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input 
                    id="productName" 
                    name="productName" 
                    placeholder="Auto-generated" 
                    value={addProductName}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Component Prices (₹)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frontPanel">Front Panel</Label>
                    <Input id="frontPanel" name="frontPanel" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panel">Panel</Label>
                    <Input id="panel" name="panel" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screenNonTouch">Screen Non-Touch</Label>
                    <Input id="screenNonTouch" name="screenNonTouch" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screenTouch">Screen Touch</Label>
                    <Input id="screenTouch" name="screenTouch" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hinge">Hinge</Label>
                    <Input id="hinge" name="hinge" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="touchPad">Touch Pad</Label>
                    <Input id="touchPad" name="touchPad" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base">Base</Label>
                    <Input id="base" name="base" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyboard">Keyboard</Label>
                    <Input id="keyboard" name="keyboard" type="number" step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery">Battery</Label>
                    <Input id="battery" name="battery" type="number" step="0.01" min="0" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                {isLoading ? "Adding..." : "Add Spare Part"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Spare Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={onEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Spare Part</DialogTitle>
              <DialogDescription>
                Update the details and component prices for this laptop.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make</Label>
                  <Input 
                    id="edit-make" 
                    name="make" 
                    value={editFormData.make}
                    onChange={handleEditChange}
                    placeholder="e.g. Dell" 
                    required 
                    pattern="^(?!\d+$).+" 
                    title="Make cannot be only numbers" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modelNumber">Model Number</Label>
                  <Input 
                    id="edit-modelNumber" 
                    name="modelNumber" 
                    value={editFormData.modelNumber}
                    onChange={handleEditChange}
                    placeholder="e.g. XPS 13" 
                    required 
                    pattern="^(?!\d+$).+" 
                    title="Model Number cannot be only numbers" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cpu">CPU</Label>
                  <Input 
                    id="edit-cpu" 
                    name="cpu" 
                    value={editFormData.cpu}
                    onChange={handleEditChange}
                    placeholder="e.g. i7" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-generation">Generation</Label>
                  <Input 
                    id="edit-generation" 
                    name="generation" 
                    value={editFormData.generation}
                    onChange={handleEditChange}
                    placeholder="e.g. 11th Gen" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-productName">Product Name</Label>
                  <Input 
                    id="edit-productName" 
                    name="productName" 
                    value={editProductName}
                    readOnly
                    className="bg-muted"
                    placeholder="Auto-generated" 
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Component Prices (₹)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-frontPanel">Front Panel</Label>
                    <Input id="edit-frontPanel" name="frontPanel" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.frontPanel || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-panel">Panel</Label>
                    <Input id="edit-panel" name="panel" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.panel || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-screenNonTouch">Screen Non-Touch</Label>
                    <Input id="edit-screenNonTouch" name="screenNonTouch" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.screenNonTouch || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-screenTouch">Screen Touch</Label>
                    <Input id="edit-screenTouch" name="screenTouch" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.screenTouch || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-hinge">Hinge</Label>
                    <Input id="edit-hinge" name="hinge" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.hinge || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-touchPad">Touch Pad</Label>
                    <Input id="edit-touchPad" name="touchPad" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.touchPad || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-base">Base</Label>
                    <Input id="edit-base" name="base" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.base || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-keyboard">Keyboard</Label>
                    <Input id="edit-keyboard" name="keyboard" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.keyboard || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-battery">Battery</Label>
                    <Input id="edit-battery" name="battery" type="number" step="0.01" min="0" defaultValue={selectedSparePart?.battery || ""} />
                  </div>
                </div>
              </div>
            </div>
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
        onConfirm={handleDeletePart}
        title="Delete Spare Part"
        description={`Are you sure you want to delete ${selectedSparePart?.make} ${selectedSparePart?.modelNumber}? This action cannot be undone.`}
        loading={isDeleting}
      />

      <DeleteConfirmDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Spare Parts"
        description={`Are you sure you want to delete ${selectedPartsForBulk.length} spare parts? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  )
}
