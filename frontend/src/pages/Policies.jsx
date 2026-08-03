import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CalendarX, Scale, HelpCircle } from 'lucide-react';

const Policies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('view') || 'cancellation';

  const handleTabSelect = (tab) => {
    setSearchParams({ view: tab });
  };

  const tabs = [
    { id: 'cancellation', name: 'Cancellation Policy', icon: CalendarX },
    { id: 'terms', name: 'Terms & Conditions', icon: Scale },
    { id: 'privacy', name: 'Privacy Policy', icon: ShieldCheck },
    { id: 'faq', name: 'Event FAQs', icon: HelpCircle }
  ];

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">Company Policies</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Platform Governance, Terms & FAQs</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap justify-center bg-[#080f1e] p-1.5 rounded-lg border border-gold-400/10 mb-12 gap-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`px-5 py-2.5 font-outfit text-xs font-semibold tracking-wider rounded uppercase flex items-center gap-2 transition-colors ${
                  currentTab === tab.id
                    ? 'bg-gold-400 text-black shadow-luxury'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Policy Contents */}
        <div className="bg-slate-950/40 border border-gold-400/15 p-8 rounded-lg space-y-6 text-sm leading-relaxed text-zinc-400 font-sans">
          
          {/* A. Cancellation Policy */}
          {currentTab === 'cancellation' && (
            <div className="space-y-4">
              <h2 className="font-playfair text-2xl text-white font-bold tracking-wider mb-4">Refund & Cancellation Rules</h2>
              <p>
                We understand that event logistics can shift. However, because our design setups require customized floral pre-cutting, balloon inflations, and dedicated labor logistics, the following booking cancellation parameters are strictly enforced:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white">Cancellations made 7 days prior to event date:</strong> Full refund of booking amount minus a ₹2,000 administrative setup conflict fee.
                </li>
                <li>
                  <strong className="text-white">Cancellations made 48h to 7 days prior to event date:</strong> 50% refund of the booking amount.
                </li>
                <li>
                  <strong className="text-white">Cancellations made within 48h of event date:</strong> Non-refundable (100% forfeiture of the paid booking amount) as custom florals are pre-cut and props are already dispatched.
                </li>
                <li>
                  <strong className="text-white">Rescheduling:</strong> You may request date rescheduling up to 72 hours prior to the event, subject to resource and prop availability. A rescheduling fee of ₹3,000 will be added.
                </li>
              </ul>
            </div>
          )}

          {/* B. Terms & Conditions */}
          {currentTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="font-playfair text-2xl text-white font-bold tracking-wider mb-4">Terms & Conditions of Service</h2>
              <p>
                By accessing this platform and making payments for booking stages or renting props, you confirm compliance with the following guidelines:
              </p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>
                  <strong className="text-white">Rental Prop Custody:</strong> Rented items are delivered for a standard duration of 24 hours. The client assumes complete custody of the props. Any structural damage, breakage, or loss of props will attract damage charges equivalent to 1.5x the market value of the item.
                </li>
                <li>
                  <strong className="text-white">Setup Access:</strong> The customer must ensure that the designated venue allows our styling team entry at least 4-6 hours prior to the event time slot. HappyMoments is not liable for delays caused by venue access entry bans.
                </li>
                <li>
                  <strong className="text-white">Power Supply:</strong> For all LED alphabets, marquee numbers, and neon signs, a stable 220V power supply must be arranged within 10 meters of the setup point by the client.
                </li>
              </ul>
            </div>
          )}

          {/* C. Privacy Policy */}
          {currentTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="font-playfair text-2xl text-white font-bold tracking-wider mb-4">User Privacy Guard</h2>
              <p>
                HappyMoments values your personal security and confidentiality. Here is a summary of how we manage user particulars:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white">Collection of Information:</strong> We store login name, email, contact telephone, and booking address history. Password strings are encrypted instantly using bcrypt hashing in our database.
                </li>
                <li>
                  <strong className="text-white">Transaction Logs:</strong> Online payments are routed directly to Razorpay's secure SDK. We never parse, view, or record credit card credentials or bank passwords in our database. Only Razorpay transaction IDs, status logs, and signatures are recorded.
                </li>
                <li>
                  <strong className="text-white">Third-Party Shares:</strong> We never sell, exchange, or share customer emails or event locations with third-party advertisers.
                </li>
              </ul>
            </div>
          )}

          {/* D. FAQs */}
          {currentTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="font-playfair text-2xl text-white font-bold tracking-wider mb-4">Event FAQs</h2>
              
              <div className="space-y-2">
                <h4 className="font-outfit text-white font-bold text-sm">Q1. Can I book decoration packages and rent props in a single cart?</h4>
                <p className="text-xs">Yes! Our platform supports a unified cart. You can add one wedding stage service package and rent additional LED marquee numbers and plinths together, checking out with a single combined Razorpay payment.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-outfit text-white font-bold text-sm">Q2. What geographical areas do you service?</h4>
                <p className="text-xs">We currently operate and deliver setups across Hyderabad and surrounding function halls. Additional transportation surcharges may apply for setups outside the city limits.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-outfit text-white font-bold text-sm">Q3. Does the pricing include transportation and teardown?</h4>
                <p className="text-xs">A flat setup, delivery, and dismantling fee of ₹1,500 is added at checkout. This covers roundtrip transport, physical backdrop framing setup by our team, and teardown after the event.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Policies;
