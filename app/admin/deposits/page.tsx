"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, Download, Eye, Filter, Search, X } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { AppSidebar } from "@/components/app-sidebar"

type Deposit = {
  id: number
  amount: number
  method: string
  screenshot: string
  status: string
  createdAt: string
  updatedAt: string
  userId: number
  user: {
    id: number
    email: string
  }
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/deposits")
      if (!response.ok) {
        throw new Error("Failed to fetch deposits")
      }
      const data = await response.json()
      setDeposits(data.deposits)
    } catch (error) {
      console.error("Error fetching deposits:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load deposits. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter deposits based on search term and status filter
  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.id.toString().includes(searchTerm) || deposit.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || deposit.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "verified":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const handleVerify = async () => {
    if (!selectedDeposit) return

    setIsVerifying(true)

    try {
      const response = await fetch(`/api/deposits/${selectedDeposit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "verified" }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify deposit")
      }

      toast({
        title: "Deposit verified successfully",
        description: `Deposit ${selectedDeposit.id} has been verified and funds added to user's balance.`,
      })

      // Close the dialog and refresh deposits
      setSelectedDeposit(null)
      fetchDeposits()
    } catch (error) {
      console.error("Verification error:", error)
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "There was an error verifying the deposit. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDeposit) return

    setIsRejecting(true)

    try {
      const response = await fetch(`/api/deposits/${selectedDeposit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject deposit")
      }

      toast({
        title: "Deposit rejected",
        description: `Deposit ${selectedDeposit.id} has been rejected.`,
      })

      // Close the dialog and refresh deposits
      setSelectedDeposit(null)
      fetchDeposits()
    } catch (error) {
      console.error("Rejection error:", error)
      toast({
        variant: "destructive",
        title: "Rejection failed",
        description: "There was an error rejecting the deposit. Please try again.",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Deposit Management</h1>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search deposits..."
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
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Deposit Verification</CardTitle>
            <CardDescription className="text-slate-400">
              Verify user deposits and update account balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-800">
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading deposits...
                    </TableCell>
                  </TableRow>
                ) : filteredDeposits.length > 0 ? (
                  filteredDeposits.map((deposit) => (
                    <TableRow key={deposit.id} className="hover:bg-slate-700">
                      <TableCell>{deposit.id}</TableCell>
                      <TableCell>{deposit.user.email}</TableCell>
                      <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                      <TableCell>{deposit.method}</TableCell>
                      <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDeposit(deposit)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                      No deposits found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-3xl">
            <DialogHeader>
              <DialogTitle>Deposit Details - {selectedDeposit?.id}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Verify payment proof and update user balance
              </DialogDescription>
            </DialogHeader>

            {selectedDeposit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Deposit ID</p>
                      <p className="font-medium">{selectedDeposit.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Status</p>
                      <div>{getStatusBadge(selectedDeposit.status)}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">User ID</p>
                      <p className="font-medium">{selectedDeposit.userId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="font-medium">{selectedDeposit.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Amount</p>
                      <p className="font-medium">${selectedDeposit.amount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Method</p>
                      <p className="font-medium">{selectedDeposit.method}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="font-medium">{new Date(selectedDeposit.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Payment Proof</p>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                      <Image
                        src="/placeholder.svg"
                        alt="Payment proof"
                        width={400}
                        height={400}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedDeposit?.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isRejecting || isVerifying}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    {isRejecting ? "Rejecting..." : "Reject Deposit"}
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || isRejecting}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="h-4 w-4" />
                    {isVerifying ? "Verifying..." : "Verify & Add Balance"}
                  </Button>
                </>
              )}
              {selectedDeposit?.status !== "pending" && (
                <Button variant="outline" onClick={() => setSelectedDeposit(null)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
