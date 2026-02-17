'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface Bookmark {
    id: string
    title: string
    url: string
}

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(true)

    const [adding, setAdding] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const router = useRouter()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.replace('/')
            } else {
                setUser(session.user)
            }
        })

        const checkSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (!data.session) {
                router.replace('/')
            } else {
                setUser(data.session.user)
            }
            setLoading(false)
        }

        checkSession()

        return () => subscription.unsubscribe()
    }, [router])

    useEffect(() => {
        if (!user) return

        const fetchBookmarks = async () => {
            const { data } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setBookmarks(data || [])
        }

        fetchBookmarks()
    }, [user])

    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel('bookmarks-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    if (payload.new.user_id !== user.id) return

                    setBookmarks((prev) => {
                        if (prev.some((b) => b.id === payload.new.id)) return prev
                        return [payload.new as Bookmark, ...prev]
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    setBookmarks((prev) =>
                        prev.filter((b) => b.id !== payload.old.id)
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const addBookmark = async () => {
        if (!title || !url || adding) return

        try {
            setAdding(true)

            const tempId = crypto.randomUUID()

            const optimisticBookmark: Bookmark = {
                id: tempId,
                title,
                url,
            }

            setBookmarks((prev) => [optimisticBookmark, ...prev])

            const { data, error } = await supabase
                .from('bookmarks')
                .insert({
                    title,
                    url,
                    user_id: user.id,
                })
                .select()
                .single()

            if (error) throw error

            setBookmarks((prev) =>
                prev.map((b) => (b.id === tempId ? data : b))
            )

            setTitle('')
            setUrl('')
        } catch (err) {
            console.error(err)
        } finally {
            setAdding(false)
        }
    }


    const deleteBookmark = async (id: string) => {
        if (deletingId) return

        try {
            setDeletingId(id)

            setBookmarks((prev) => prev.filter((b) => b.id !== id))

            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (err) {
            console.error(err)
        } finally {
            setDeletingId(null)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-400 animate-pulse">
                    Loading dashboard...
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Bookmarks
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Add Form */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
                        placeholder="Bookmark Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        onClick={addBookmark}
                        disabled={adding}
                        className={`px-6 py-3 rounded-xl font-semibold transition ${adding
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {adding ? 'Adding...' : 'Add'}
                    </button>
                </div>

                {/* Bookmark List */}
                <div className="space-y-4">
                    {bookmarks.length === 0 && (
                        <p className="text-gray-400 text-center">
                            No bookmarks yet 🚀
                        </p>
                    )}

                    {bookmarks.map((b) => (
                        <div
                            key={b.id}
                            className="flex justify-between items-center p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
                        >
                            <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-400 hover:underline truncate"
                            >
                                {b.title}
                            </a>

                            <button
                                onClick={() => deleteBookmark(b.id)}
                                disabled={deletingId === b.id}
                                className={`transition ${deletingId === b.id
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-red-400 hover:text-red-500'
                                    }`}
                            >
                                {deletingId === b.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
