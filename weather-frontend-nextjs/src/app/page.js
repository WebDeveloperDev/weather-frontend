"use client"

import { useState } from "react"
import WeatherModal from "../components/WeatherModal"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="container">
      <main className="main-content">
        <h1 className="title">Smart Tourist Safety App</h1>
        <p className="description">
          Get real-time weather information and traffic updates for any city. Stay informed and plan your travels safely
          with our comprehensive weather and traffic monitoring system.
        </p>
        <button className="action-button" onClick={openModal}>
          Check Weather & Traffic
        </button>
      </main>

      <WeatherModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}
