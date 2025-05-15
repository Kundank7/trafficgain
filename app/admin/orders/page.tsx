"use client"

import { useState, useEffect } from "react"
import { Eye, Filter, Globe, Laptop, Search, Smartphone, Tablet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { AppSidebar } from "@/components/app-sidebar"

type Order = {
  id: number
  quantity: number
  country: string
  device: string
  cost: number
  status: string
  progress: number
  createdAt: string
  updatedAt: string
  userId: number
  user: {
    id: number
    email: string
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editProgress, setEditProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/orders")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.country.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>
      case "running":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Running</Badge>
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  // Get device icon
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      case "desktop":
        return <Laptop className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
    setEditProgress(order.progress)
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editStatus,
          progress: editProgress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order")
      }

      toast({
        title: "Order updated successfully",
        description: `Order ${selectedOrder.id} has been updated.`,
      })

      // Close the dialog and refresh orders
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      console.error("Update order error:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the order. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Order Management</h1>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                className="pl-10 bg-slate-800 border-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription className="text-slate-400">Manage and track traffic orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-800">
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-700">
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span>{order.country}</span>
                          {getDeviceIcon(order.device)}
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity.toLocaleString()}</TableCell>
                      <TableCell>${order.cost.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={order.progress} className="h-2 w-[60px]" />
                          <span className="text-xs">{order.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                      No orders found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
              <DialogDescription className="text-slate-400">Update order status and progress</DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Order ID</p>
                    <p className="font-medium">{selectedOrder.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">User</p>
                    <p className="font-medium">{selectedOrder.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Country</p>
                    <p className="font-medium">{selectedOrder.country}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Device</p>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(selectedOrder.device)}
                      <p className="font-medium capitalize">{selectedOrder.device}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Quantity</p>
                    <p className="font-medium">{selectedOrder.quantity.toLocaleString()} visitors</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Cost</p>
                    <p className="font-medium">${selectedOrder.cost.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Created</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Last Updated</p>
                    <p className="font-medium">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Progress</label>
                      <span className="text-sm">{editProgress}%</span>
                    </div>
                    <Slider
                      value={[editProgress]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setEditProgress(value[0])}
                      className="[&>span]:bg-emerald-400"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateOrder}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
