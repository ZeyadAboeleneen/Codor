"use client"

import { useState, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, ChevronLeft, ChevronRight, RefreshCw, Shield, User, Trash2 } from "lucide-react"

interface UserData {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  created_at: string
}

interface UsersTabProps {
  getAuthToken: () => string
}

export function UsersTab({ getAuthToken }: UsersTabProps) {
  const t = useTranslations()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchUsers = useCallback(async (p = page, s = search, rf = roleFilter) => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const params = new URLSearchParams({ page: String(p), limit: "20" })
      if (s) params.set("search", s)
      if (rf && rf !== "all") params.set("role", rf)

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [getAuthToken, page, search, roleFilter])

  useEffect(() => {
    fetchUsers(page, search, roleFilter)
  }, [page, roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(1, search, roleFilter)
  }

  const toggleRole = async (user: UserData) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    setUpdatingId(user.id)
    try {
      const token = getAuthToken()
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)))
      }
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setDeletingId(userId)
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setTotal((t) => t - 1)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-gold-400" />
          {t("usersTitle")} ({total})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(page, search, roleFilter)}
          className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          {t("refresh")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchUsers")}
              className="pr-10 bg-dark-400 border-white/10 text-white placeholder:text-gray-500 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="bg-gold-500 text-dark-900 hover:bg-gold-400">
            {t("searchLabel")}
          </Button>
        </form>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="bg-dark-400 border-white/10 text-white w-full sm:w-40">
            <SelectValue placeholder={t("allRolesFilter")} />
          </SelectTrigger>
          <SelectContent className="bg-dark-400 border-white/10">
            <SelectItem value="all">{t("allRolesFilter")}</SelectItem>
            <SelectItem value="admin">{t("adminRole")}</SelectItem>
            <SelectItem value="user">{t("userRole")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("loadingProducts")}</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{t("noProducts")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="bg-dark-400 border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === "admin" ? "bg-gold-500/20" : "bg-blue-500/20"}`}>
                      {user.role === "admin" ? <Shield className="h-4 w-4 text-gold-400" /> : <User className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">{user.name}</p>
                        <Badge className={`text-[10px] border ${user.role === "admin" ? "bg-gold-500/20 text-gold-400 border-gold-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                          {user.role === "admin" ? t("adminRole") : t("userRole")}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      <p className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRole(user)}
                      disabled={updatingId === user.id}
                      className={`text-xs bg-transparent border-white/10 hover:border-gold-500/30 ${updatingId === user.id ? "opacity-50" : ""}`}
                    >
                      {updatingId === user.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : user.role === "admin" ? t("removeAdmin") : t("makeAdmin")}
                    </Button>

                    {confirmDelete === user.id ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" onClick={() => deleteUser(user.id)} disabled={deletingId === user.id} className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2">
                          {t("confirm")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)} className="bg-transparent border-white/10 text-gray-400 text-xs h-7 px-2">
                          {t("cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setConfirmDelete(user.id)} className="bg-transparent border-white/10 text-red-400 hover:text-red-300 hover:border-red-500/30 h-8 w-8 p-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="bg-transparent border-white/10 text-gray-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="bg-transparent border-white/10 text-gray-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
