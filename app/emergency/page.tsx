"use client"

export default function EmergencyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Emergency Assistance</h1>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-alert-triangle"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          Emergency Warning
        </div>
        <p className="text-red-600">
          If you are experiencing a life-threatening emergency, please call 911 immediately or go to your nearest
          emergency room.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Emergency Services</h2>
          <p className="mb-4">For immediate emergency assistance:</p>
          <a
            href="tel:911"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded text-center mb-4"
          >
            Call 911
          </a>
          <p className="text-sm text-gray-600">
            Call 911 for life-threatening emergencies requiring immediate medical attention.
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Find Nearby Facilities</h2>
          <p className="mb-4">Locate emergency care facilities in your area:</p>
          <button
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-center mb-4"
            onClick={() => {}}
          >
            Find Nearby Hospitals
          </button>
          <p className="text-sm text-gray-600">Search for the closest emergency rooms and urgent care centers.</p>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">When to Use Emergency Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Call 911 for:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chest pain or difficulty breathing</li>
              <li>Severe bleeding or head trauma</li>
              <li>Loss of consciousness</li>
              <li>Severe burns or injuries</li>
              <li>Signs of stroke (face drooping, arm weakness, speech difficulty)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Visit Urgent Care for:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Minor cuts requiring stitches</li>
              <li>Sprains and minor broken bones</li>
              <li>Fever without rash</li>
              <li>Moderate asthma</li>
              <li>Vomiting, diarrhea, or dehydration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
