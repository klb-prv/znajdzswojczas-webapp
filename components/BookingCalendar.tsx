'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, isBefore, startOfDay, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import BookingForm from '@/components/BookingForm'
import 'react-day-picker/dist/style.css'

interface Props {
  blockedDates: string[]   // YYYY-MM-DD
  takenDates: string[]     // YYYY-MM-DD
}

// Święta: 24-25 grudnia, kilka lat z góry
function getHolidayDates(): Date[] {
  const year = new Date().getFullYear()
  const dates: Date[] = []
  for (let y = year; y <= year + 3; y++) {
    dates.push(new Date(y, 11, 24))
    dates.push(new Date(y, 11, 25))
  }
  return dates
}

const HOLIDAYS = getHolidayDates()
const HOLIDAY_KEY_SET = new Set(HOLIDAYS.map((d) => format(d, 'yyyy-MM-dd')))

export default function BookingCalendar({ blockedDates, takenDates }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today    = startOfDay(new Date())
  const tomorrow = addDays(today, 1)

  const allUnavailable = new Set([
    ...blockedDates,
    ...takenDates,
    ...Array.from(HOLIDAY_KEY_SET),
  ])

  const blockedDays = blockedDates.map((d) => parseISO(d))
  const takenDays   = takenDates.map((d) => parseISO(d))

  const handleDayClick = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd')
    if (isBefore(startOfDay(day), tomorrow)) return  // dzisiaj i przeszłość zablokowane
    if (allUnavailable.has(key)) return
    setSelectedDate(key)
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">Wybierz termin</h2>
      <p className="text-xs text-gray-400 mb-4">Kliknij wolny dzień -rezerwacje możliwe od jutra</p>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          locale={pl}
          disabled={[
            { before: tomorrow },
            ...blockedDays,
            ...takenDays,
            ...HOLIDAYS,
          ]}
          modifiers={{
            blocked:  blockedDays,
            taken:    takenDays,
            holiday:  HOLIDAYS,
            selected: selectedDate ? [parseISO(selectedDate)] : [],
          }}
          modifiersClassNames={{
            blocked:  'rdp-day_blocked',
            taken:    'rdp-day_taken',
            holiday:  'rdp-day_holiday',
            selected: 'rdp-day_chosen',
          }}
          onDayClick={handleDayClick}
          selected={selectedDate ? parseISO(selectedDate) : undefined}
          fromMonth={new Date()}
        />
      </div>

      <style>{`
        .rdp-day_blocked {
          box-shadow: inset 0 0 0 2px #d97706 !important;
          color: #d97706 !important;
          border-radius: 50%;
        }
        .rdp-day_taken {
          box-shadow: inset 0 0 0 2px #ef4444 !important;
          color: #ef4444 !important;
          border-radius: 50%;
          text-decoration: line-through;
        }
        .rdp-day_holiday {
          box-shadow: inset 0 0 0 2px #9ca3af !important;
          color: #9ca3af !important;
          border-radius: 50%;
        }
        .rdp-day_chosen {
          background: #2563eb !important;
          color: white !important;
          border-radius: 50%;
          font-weight: 700;
          box-shadow: none !important;
        }
        .rdp-day:not([disabled]):not(.rdp-day_chosen):not(.rdp-day_blocked):not(.rdp-day_taken):not(.rdp-day_holiday):hover {
          background: #dbeafe !important;
          color: #1d4ed8 !important;
        }
      `}</style>

      <div className="flex gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-500 justify-center flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full ring-2 ring-blue-300" /> Wolny
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full ring-2 ring-red-400" /> Zajęty
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full ring-2 ring-amber-500" /> Urlop
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full ring-2 ring-gray-400" /> Święto
        </span>
      </div>

      {selectedDate && (
        <div className="mt-6 border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">
            Wybrany termin:{' '}
            <span className="font-semibold text-blue-600">
              {format(parseISO(selectedDate), 'd MMMM yyyy', { locale: pl })}
            </span>
          </p>
          <BookingForm date={selectedDate} onSuccess={() => setSelectedDate(null)} />
        </div>
      )}
    </div>
  )
}
