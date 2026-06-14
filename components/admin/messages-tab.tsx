"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCheck, Trash2, RefreshCw, MessageSquare } from "lucide-react"

interface ContactMessage {
  _id: string
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

interface MessagesTabProps {
  messages: ContactMessage[]
  setMessages: (msgs: ContactMessage[]) => void
  getAuthToken: () => string
}

export function MessagesTab({ messages, setMessages, getAuthToken }: MessagesTabProps) {
  const t = useTranslations()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const markAsRead = async (msg: ContactMessage) => {
    const id = msg.id || msg._id
    setLoadingId(id)
    try {
      const token = getAuthToken()
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, isRead: true }),
      })
      if (res.ok) {
        setMessages(messages.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)))
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    } finally {
      setLoadingId(null)
    }
  }

  const deleteMessage = async (msg: ContactMessage) => {
    const id = msg.id || msg._id
    setLoadingId(id)
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setMessages(messages.filter((m) => m._id !== msg._id))
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setLoadingId(null)
      setConfirmDelete(null)
    }
  }

  const markAllRead = async () => {
    const token = getAuthToken()
    const unread = messages.filter((m) => !m.isRead)
    for (const msg of unread) {
      const id = msg.id || msg._id
      try {
        await fetch("/api/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id, isRead: true }),
        })
      } catch {}
    }
    setMessages(messages.map((m) => ({ ...m, isRead: true })))
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gold-400" />
          {t("messagesTitle")} ({messages.length})
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {unreadCount} {t("unreadBadge")}
            </Badge>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400 hover:border-gold-500/30"
          >
            <CheckCheck className="h-4 w-4 ml-2" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{t("noMessages")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => {
            const id = msg.id || msg._id
            return (
              <Card
                key={msg._id}
                className={`border-white/10 transition-colors ${msg.isRead ? "bg-dark-400" : "bg-dark-400 border-r-2 border-r-gold-500"}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-white text-sm">{msg.name}</p>
                        {!msg.isRead && (
                          <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-[10px]">
                            {t("unreadBadge")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gold-400 text-sm font-medium mb-1">{msg.subject}</p>
                      <p className="text-gray-400 text-sm line-clamp-2">{msg.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                        <span>{msg.email}</span>
                        {msg.phone && <span>• {msg.phone}</span>}
                        <span>• {new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        className="text-gold-400 hover:text-gold-300 text-sm whitespace-nowrap"
                      >
                        ↗
                      </a>

                      {!msg.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(msg)}
                          disabled={loadingId === id}
                          title={t("markAsRead")}
                          className="bg-transparent border-white/10 text-gray-300 hover:text-green-400 hover:border-green-500/30 h-8 px-2 text-xs"
                        >
                          {loadingId === id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                        </Button>
                      )}

                      {confirmDelete === id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={() => deleteMessage(msg)} disabled={loadingId === id} className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2">
                            {t("deleteLabel")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)} className="bg-transparent border-white/10 text-gray-400 text-xs h-7 px-2">
                            {t("cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setConfirmDelete(id)} className="bg-transparent border-white/10 text-red-400 hover:text-red-300 hover:border-red-500/30 h-8 w-8 p-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
