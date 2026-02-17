"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, ArrowUpDown, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { addProduct, updateProduct, deleteProduct, bulkDeleteProducts } from "@/actions/products"
import { bulkUploadProducts } from "@/actions/bulk-upload"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { BulkUploadDialog } from "@/components/dashboard/bulk-upload-dialog"
import { toast } from "sonner"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import * as XLSX from "xlsx"

export type Product = {
  id: string
  make: string
  modelNumber: string
  cpu: string | null
  generation: string | null
  productName: string | null
  ram: string | null
  ssd: string | null
  hdd: string | null
  salePrice: number
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [selectedProductsForBulk, setSelectedProductsForBulk] = useState<Product[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const columns: ColumnDef<Product>[] = [
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
        accessorKey: "ram",
        header: "RAM",
    },
    {
        accessorKey: "ssd",
        header: "SSD",
    },
    {
        accessorKey: "hdd",
        header: "HDD",
    },
    {
        accessorKey: "salePrice",
        header: "Sale Price",
        cell: ({ row }) => `₹${Number(row.getValue("salePrice")).toLocaleString()}`,
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
              setSelectedProduct(row.original)
              setIsEditDialogOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedProduct(row.original)
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    const result = await addProduct(formData)
    
    if (result.success) {
      setIsAddDialogOpen(false)
      router.refresh()
      toast.success("Product added successfully")
    } else {
      setFormError(result.error || "Failed to add product")
      toast.error(result.error || "Failed to add product")
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    if (!selectedProduct) return
    
    const formData = new FormData(e.currentTarget)
    const result = await updateProduct(selectedProduct.id, formData)
    
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      router.refresh()
      toast.success("Product updated successfully")
    } else {
      setFormError(result.error || "Failed to update product")
      toast.error(result.error || "Failed to update product")
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    setIsDeleting(true)
    const result = await deleteProduct(selectedProduct.id)
    setIsDeleting(false)
    
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
      toast.success("Product deleted successfully")
      router.refresh()
    } else {
      toast.error("Failed to delete product")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProductsForBulk.length === 0) return
    setIsDeleting(true)
    const ids = selectedProductsForBulk.map(p => p.id)
    const result = await bulkDeleteProducts(ids)
    setIsDeleting(false)
    
    if (result.success) {
      setIsBulkDeleteDialogOpen(false)
      setSelectedProductsForBulk([])
      toast.success(`Successfully deleted ${ids.length} products`)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete products")
    }
  }

  const handleExport = () => {
    try {
      const exportData = initialProducts.map((p, index) => ({
        "S.No": index + 1,
        "Make": p.make,
        "Model Number": p.modelNumber,
        "CPU": p.cpu || "-",
        "Generation": p.generation || "-",
        "Product Name": p.productName || "-",
        "RAM": p.ram || "-",
        "SSD": p.ssd || "-",
        "HDD": p.hdd || "-",
        "Sale Price": p.salePrice
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, `Products_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Products exported successfully");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export products");
    }
  };

  return (
    <div className="py-2 px-1 sm:px-0">
      <DataTable 
        columns={columns} 
        data={initialProducts} 
        title="Product Master" 
        onAdd={() => setIsAddDialogOpen(true)} 
        onBulkDelete={(products) => {
          setSelectedProductsForBulk(products)
          setIsBulkDeleteDialogOpen(true)
        }}
        onExport={handleExport}
        actions={
          <BulkUploadDialog 
            title="Products" 
            onUpload={bulkUploadProducts} 
            templateFields={["make", "modelNumber", "cpu", "generation", "productName", "ram", "ssd", "hdd", "salePrice"]}
          />
        }
      />

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) setFormError(null)
      }}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleAddProduct}>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details of the laptop for the Product Master.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" placeholder="e.g. Dell" required pattern="^(?!\d+$).+" title="Make cannot be only numbers" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input id="modelNumber" name="modelNumber" placeholder="e.g. Latitude 5420" required pattern="^(?!\d+$).+" title="Model Number cannot be only numbers" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">CPU</Label>
                  <Input id="cpu" name="cpu" placeholder="e.g. i5-1145G7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generation">Generation</Label>
                  <Input id="generation" name="generation" placeholder="e.g. 11th Gen" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" name="productName" placeholder="e.g. Laptop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ram">RAM</Label>
                  <Input id="ram" name="ram" placeholder="e.g. 16GB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ssd">SSD</Label>
                  <Input id="ssd" name="ssd" placeholder="e.g. 512GB" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hdd">HDD</Label>
                  <Input id="hdd" name="hdd" placeholder="e.g. 1TB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (₹)</Label>
                  <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Add Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) setFormError(null)
      }}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdateProduct}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details for this product.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make</Label>
                  <Input id="edit-make" name="make" defaultValue={selectedProduct?.make} placeholder="e.g. Dell" required pattern="^(?!\d+$).+" title="Make cannot be only numbers" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modelNumber">Model Number</Label>
                  <Input id="edit-modelNumber" name="modelNumber" defaultValue={selectedProduct?.modelNumber} placeholder="e.g. Latitude 5420" required pattern="^(?!\d+$).+" title="Model Number cannot be only numbers" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cpu">CPU</Label>
                  <Input id="edit-cpu" name="cpu" defaultValue={selectedProduct?.cpu || ""} placeholder="e.g. i5-1145G7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-generation">Generation</Label>
                  <Input id="edit-generation" name="generation" defaultValue={selectedProduct?.generation || ""} placeholder="e.g. 11th Gen" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-productName">Product Name</Label>
                  <Input id="edit-productName" name="productName" defaultValue={selectedProduct?.productName || ""} placeholder="e.g. Laptop" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="edit-ram">RAM</Label>
                   <Input id="edit-ram" name="ram" defaultValue={selectedProduct?.ram || ""} placeholder="e.g. 16GB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label htmlFor="edit-ssd">SSD</Label>
                   <Input id="edit-ssd" name="ssd" defaultValue={selectedProduct?.ssd || ""} placeholder="e.g. 512GB" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="edit-hdd">HDD</Label>
                   <Input id="edit-hdd" name="hdd" defaultValue={selectedProduct?.hdd || ""} placeholder="e.g. 1TB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-salePrice">Sale Price (₹)</Label>
                  <Input id="edit-salePrice" name="salePrice" type="number" step="0.01" min="0" defaultValue={selectedProduct?.salePrice} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Update Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description={`Are you sure you want to delete ${selectedProduct?.make} ${selectedProduct?.modelNumber}? This action cannot be undone.`}
        loading={isDeleting}
      />

      <DeleteConfirmDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Products"
        description={`Are you sure you want to delete ${selectedProductsForBulk.length} products? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  )
}
