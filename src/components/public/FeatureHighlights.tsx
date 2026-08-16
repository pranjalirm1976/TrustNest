'use client'

import { ShieldCheck, UtensilsCrossed, Clock, CheckCircle } from 'lucide-react'

export default function FeatureHighlights() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
      title: 'Verified TrustNest Score',
      description: 'Transparent audit score computed daily using actual resident feedback, complaint response times, and health reports. No fake profiles, no sponsored bias.',
    },
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-brand-primary" />,
      title: 'Daily Food Transparency',
      description: 'See the exact breakfast, lunch, and dinner menu before you rent. View live resident ratings and real daily photos uploaded by the PG managers.',
    },
    {
      icon: <Clock className="w-6 h-6 text-brand-primary" />,
      title: '24-Hour SLA Protection',
      description: 'Raise maintenance complaints directly through your tenant app. Landlords are bound by contract to resolve issues within 24 hours or face penalty flags.',
    },
  ]

  return (
    <section className="bg-white py-20 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Why TrustNest?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Standard of Transparency in Co-Living
          </h2>
          <p className="text-slate-500">
            We hold PG operators accountable by placing residents in control. Every PG in our system undergoes verified screening, live food auditing, and SLA compliance checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="group p-8 bg-[#fbfbfb] border border-slate-200/60 rounded-2xl flex flex-col gap-6 shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-[2px]"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {feature.title}
                  <CheckCircle className="w-4 h-4 text-brand-success opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
