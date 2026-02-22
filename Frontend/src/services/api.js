// Frontend/src/services/api.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Always gets the freshest token from the live Supabase session
const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token ?? null
}

const authFetch = async (method, path, body = null) => {
    const token = await getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`)
    return text ? JSON.parse(text) : null
}

export const api = {
    // ── Auth ─────────────────────────────────────────────────────────────────
    register: (email, password) =>
        supabase.auth.signUp({ email, password }),

    login: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),

    logout: () => supabase.auth.signOut(),

    getUser: () => supabase.auth.getUser(),

    // ── Onboarding ───────────────────────────────────────────────────────────
    // payload must match ExporterProfile schema
    saveProfile: (payload) =>
        authFetch('POST', '/onboard/exporter', payload),

    getMyProfile: () =>
        authFetch('GET', '/onboard/exporter/me'),

    // ── ML ───────────────────────────────────────────────────────────────────
    // run-sync blocks until ML finishes — await before loading feed
    runML: () =>
        authFetch('POST', '/ml/run-sync').catch(err => {
            console.warn('ML run warning (non-fatal):', err.message)
            return null
        }),

    // ── Discover ─────────────────────────────────────────────────────────────
    // Returns array sorted by match_rank asc (rank 1 = best)
    getFeed: () =>
        authFetch('GET', '/discover/feed'),

    // matchId = user_matches.id UUID from feed item
    // action: 'like' | 'pass' | 'skip'
    swipe: (matchId, action) =>
        authFetch('POST', '/discover/swipe', { match_id: matchId, action }),

    // ── Matches ──────────────────────────────────────────────────────────────
    getMatches: () =>
        authFetch('GET', '/matches/'),
}