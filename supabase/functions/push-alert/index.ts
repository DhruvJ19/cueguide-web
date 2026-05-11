import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!

interface CompletionPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: {
    id: string
    patient_id: string
    routine_id: string
    status: string
    date: string
  }
}

serve(async (req) => {
  try {
    const payload: CompletionPayload = await req.json()

    if (payload.table !== 'completions') {
      return new Response(JSON.stringify({ message: 'ignored' }), { status: 200 })
    }

    const { status, patient_id, routine_id } = payload.record

    if (status !== 'missed') {
      return new Response(JSON.stringify({ message: 'not-missed' }), { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: patient } = await supabase
      .from('patients')
      .select('name, caregiver_id')
      .eq('id', patient_id)
      .single()

    const { data: routine } = await supabase
      .from('routines')
      .select('name')
      .eq('id', routine_id)
      .single()

    const { data: caregiver } = await supabase
      .from('caregivers')
      .select('*')
      .eq('id', patient?.caregiver_id)
      .single()

    const notification_prefs = caregiver?.notification_prefs || {}

    const now = new Date()
    const [startH, startM] = (notification_prefs.quietHoursStart || '22:00').split(':').map(Number)
    const [endH, endM] = (notification_prefs.quietHoursEnd || '08:00').split(':').map(Number)
    const currentH = now.getHours()
    const currentM = now.getMinutes()
    const currentMin = currentH * 60 + currentM
    const quietStart = startH * 60 + startM
    const quietEnd = endH * 60 + endM

    const isQuietHours = quietStart > quietEnd
      ? currentMin >= quietStart || currentMin <= quietEnd
      : currentMin >= quietStart && currentMin <= quietEnd

    if (isQuietHours) {
      return new Response(JSON.stringify({ message: 'quiet-hours' }), { status: 200 })
    }

    const patient_name = patient?.name || 'Your loved one'
    const routine_name = routine?.name || 'their routine'
    const caregiver_name = caregiver?.name || 'Sarah'

    const title = `CueGuide Alert`
    const body = `${patient_name} missed "${routine_name}". Tap to check in.`

    console.log(`[Push Alert] Sending: ${body}`)

    return new Response(JSON.stringify({
      message: 'alert-triggered',
      title,
      body,
      caregiver_id: caregiver?.id,
      patient_name,
      routine_name
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (e) {
    console.error('[Push Alert Error]', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
