import React, { useState } from 'react'

const ProfileContent = () => {
  const [services, setServices] = useState([
    'Programming',
    'Design',
    'Mentorship',
    'Marketing',
    'Writing',
    'Illustration',
    'Music',
  ])

  const [showPopup, setShowPopup] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const handleRemoveService = (service) => {
    setSelectedService(service)
    setShowPopup(true)
  }

  const confirmRemove = () => {
    setServices(services.filter(s => s !== selectedService))
    setShowPopup(false)
    setSelectedService(null)
  }

  const cancelRemove = () => {
    setShowPopup(false)
    setSelectedService(null)
  }

  const reviews = [
    {
      reviewer: 'Reviewer 1',
      date: 'October 1, 2023',
      stars: '★★★★★',
      comment: 'Great experience! Highly recommended.',
    },
    {
      reviewer: 'Reviewer 2',
      date: 'October 2, 2023',
      stars: '★★★★☆',
      comment: 'Good service but can improve.',
    },
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Service and Skills</h2>
      <div className="flex flex-wrap gap-3 mb-14">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-[var(--color-secondary)] rounded-full px-4 py-1 flex items-center text-sm"
          >
            {service} 
            <button 
              onClick={() => handleRemoveService(service)}
              className="ml-3 text-lg hover:text-[var(--color-primary)] hover:cursor-pointer transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Remove Skill</h3>
            <p className="mb-4">Are you sure you want to remove "{selectedService}" from your skills?</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={cancelRemove}
                className="px-4 py-2 rounded hover:bg-[var(--color-hover)] hover:cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemove}
                className="px-4 py-2 bg-[var(--color-secondary)] rounded hover:bg-[var(--color-hover)] hover:cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">User Comments and Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center mb-2">
              <img
                src={`https://picsum.photos/40?random=${index + 1}`}
                alt="Reviewer"
                className="w-10 h-10 bg-gray-300 rounded-full mr-4"
              />
              <div>
                <h4 className="font-semibold">{review.reviewer}</h4>
                <p className="text-gray-700 text-sm">{review.date}</p>
              </div>
            </div>
            <p className="text-[var(--color-primary)] text-lg mb-1">{review.stars}</p>
            <p className="mb-2">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileContent