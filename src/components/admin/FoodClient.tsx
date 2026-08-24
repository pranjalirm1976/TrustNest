'use client'

import { publishDailyMenu } from '@/actions/food.actions'

import { useState } from 'react'
import { 
  Camera, 
  Clock, 
  CheckCircle2, 
  Image as ImageIcon,
  ChevronDown,
  UploadCloud,
  X
} from 'lucide-react'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner'

interface MealState {
  items: string
  timing: string
  photo: File | string | null
  isPublished: boolean
}

type MenuState = Record<MealType, MealState>

const initialTodayState: MenuState = {
  Breakfast: {
    items: 'Aloo Paratha, Curd, Pickle, Tea/Coffee',
    timing: '08:00 AM - 10:00 AM',
    photo: null,
    isPublished: true
  },
  Lunch: {
    items: '',
    timing: '01:00 PM - 03:00 PM',
    photo: null,
    isPublished: false
  },
  Dinner: {
    items: 'Dal Makhani, Paneer Butter Masala, Roti, Rice, Gulab Jamun',
    timing: '08:00 PM - 10:30 PM',
    photo: null,
    isPublished: false
  }
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function FoodClient() {
  const [activeTab, setActiveTab] = useState<'today' | 'weekly'>('today')
  const [todayMenu, setTodayMenu] = useState<MenuState>(initialTodayState)
  const [expandedDay, setExpandedDay] = useState<string>('Monday') // for mobile accordion in weekly
  const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success'|'error' } | null>(null)

  // Handlers for Today's Menu
  const handleUpdateMeal = (meal: MealType, field: keyof MealState, value: any) => {
    setTodayMenu(prev => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value }
    }))
  }

  const handleFileChange = (meal: MealType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpdateMeal(meal, 'photo', e.target.files[0])
    }
  }

  const handlePhotoUpload = (meal: MealType) => {
    // We will attach an actual file input in the render method instead of this mock click
  }

  const handlePublish = async (meal: MealType) => {
    setIsPublishing(prev => ({ ...prev, [meal]: true }))
    try {
      const data = todayMenu[meal]
      const formData = new FormData()
      formData.append('mealType', meal)
      formData.append('items', data.items)
      if (data.photo instanceof File) {
        formData.append('image', data.photo)
      }

      const res = await publishDailyMenu(formData)
      if (res.success) {
        handleUpdateMeal(meal, 'isPublished', true)
        setToastMessage({ text: 'Menu published successfully!', type: 'success' })
      } else {
        setToastMessage({ text: res.error || 'Failed to publish menu.', type: 'error' })
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || 'Error publishing menu.', type: 'error' })
    } finally {
      setIsPublishing(prev => ({ ...prev, [meal]: false }))
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleClear = (meal: MealType) => {
    setTodayMenu(prev => ({
      ...prev,
      [meal]: { items: '', timing: prev[meal].timing, photo: null, isPublished: false }
    }))
  }

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border ${
            toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toastMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 sm:px-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'today'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Today's Menu
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'weekly'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Weekly Planner
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'today' ? (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-12">
          {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map((meal) => {
            const data = todayMenu[meal]
            const isEmpty = data.items.trim() === ''
            
            return (
              <div key={meal} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{meal}</h2>
                  {data.isPublished ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-full">
                      Draft
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-8">
                  {/* Left: Input details */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Menu Items</label>
                      <textarea 
                        rows={3}
                        value={data.items}
                        onChange={(e) => handleUpdateMeal(meal, 'items', e.target.value)}
                        placeholder={`e.g. Roti, Sabzi, Dal...`}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm resize-none shadow-sm"
                      />
                      {isEmpty && (
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          No menu planned for {meal}. Residents will see "Menu Unavailable".
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Meal Timings
                      </label>
                      <input 
                        type="text" 
                        value={data.timing}
                        onChange={(e) => handleUpdateMeal(meal, 'timing', e.target.value)}
                        className="w-[200px] px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-auto pt-4">
                      <button 
                        onClick={() => handlePublish(meal)}
                        disabled={isEmpty || data.isPublished || isPublishing[meal]}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                      >
                        {isPublishing[meal] ? 'Publishing...' : data.isPublished ? 'Update Published Menu' : 'Publish Menu'}
                      </button>
                      <button 
                        onClick={() => handleClear(meal)}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2.5 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Right: Photo Uploader */}
                  <div className="w-full md:w-[320px] shrink-0">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Actual Food Photo (Optional)</label>
                      <div 
                        className={`relative w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center text-center transition-all group ${
                          data.photo 
                            ? 'bg-slate-100 border border-slate-200 overflow-hidden cursor-default' 
                            : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer'
                        }`}
                      >
                        {!data.photo && (
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={(e) => handleFileChange(meal, e)}
                          />
                        )}
                        {data.photo ? (
                          <>
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                              {/* Simulated Image preview */}
                              <ImageIcon className="w-12 h-12 text-slate-400 opacity-50" />
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateMeal(meal, 'photo', null) }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors z-20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded shadow-sm z-20">
                              <CheckCircle2 className="w-3 h-3" /> Photo uploaded
                            </div>
                          </>
                        ) : (
                          <div className="p-6 pointer-events-none">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3 mx-auto group-hover:text-indigo-600 transition-colors">
                              <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-2 group-hover:text-indigo-700 transition-colors">Drag & drop photo here</p>
                            <button type="button" className="flex items-center gap-2 mx-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors">
                              <Camera className="w-3.5 h-3.5" /> Upload Photo
                            </button>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Weekly Planner Tab */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in duration-300 mb-12">
          
          {/* Desktop Grid View */}
          <div className="hidden lg:grid grid-cols-7 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            {weekDays.map(day => (
              <div key={day} className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                {day}
              </div>
            ))}
          </div>
          
          <div className="hidden lg:grid grid-cols-7 divide-x divide-slate-100 min-h-[400px]">
            {weekDays.map(day => (
              <div key={day} className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Breakfast</h4>
                  <textarea rows={2} placeholder="Items..." className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-indigo-500 outline-none resize-none" defaultValue={day === 'Monday' ? 'Poha, Jalebi, Tea' : ''}></textarea>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lunch</h4>
                  <textarea rows={2} placeholder="Items..." className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-indigo-500 outline-none resize-none" defaultValue={day === 'Monday' ? 'Rajma Chawal, Salad' : ''}></textarea>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dinner</h4>
                  <textarea rows={2} placeholder="Items..." className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-indigo-500 outline-none resize-none" defaultValue={day === 'Monday' ? 'Roti, Mixed Veg, Dal' : ''}></textarea>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Accordion View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {weekDays.map(day => (
              <div key={day} className="flex flex-col">
                <button 
                  onClick={() => setExpandedDay(expandedDay === day ? '' : day)}
                  className="px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900">{day}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDay === day ? 'rotate-180' : ''}`} />
                </button>
                {expandedDay === day && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Breakfast</h4>
                      <input type="text" placeholder="Items..." className="w-full text-sm p-2.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none shadow-sm" defaultValue={day === 'Monday' ? 'Poha, Jalebi, Tea' : ''} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Lunch</h4>
                      <input type="text" placeholder="Items..." className="w-full text-sm p-2.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none shadow-sm" defaultValue={day === 'Monday' ? 'Rajma Chawal, Salad' : ''} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dinner</h4>
                      <input type="text" placeholder="Items..." className="w-full text-sm p-2.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none shadow-sm" defaultValue={day === 'Monday' ? 'Roti, Mixed Veg, Dal' : ''} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              Save Weekly Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
