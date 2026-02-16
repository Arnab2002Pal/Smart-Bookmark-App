'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface Bookmark {
    id: string
    title: string
    url: string
}

export default function Dashboard() {
   return (
    <div>
        Hello World
    </div>
   )
}
