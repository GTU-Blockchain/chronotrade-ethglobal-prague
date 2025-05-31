import React, { useState } from "react";

const CreateServices = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hours: "",
    category: "",
  });

  const categories = [
    "Programming",
    "Design",
    "Mentorship",
    "Oil Marketing",
    "Oil Writing",
    "Illustration",
    "Music",
    "Video Production",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  return (
    <div className="p-3 w-2xl">
      <h1 className="text-3xl font-bold mb-3">List a new service</h1>
      <p className="text-sm text-gray-600 mb-6">
        You can list any skill you have, or offer to help with anything. Be
        creative!
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="title">
            Service title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="I will help you with..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            htmlFor="description"
          >
            Service description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your service..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            rows="4"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="hours">
            Number of hours
          </label>
          <input
            type="number"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            placeholder="Enter number of hours..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 my-5 bg-[var(--color-primary)] rounded-3xl hover:bg-[var(--color-secondary)] duration-300 hover:cursor-pointer"
        >
          List Service
        </button>
      </form>
    </div>
  );
};

export default CreateServices;