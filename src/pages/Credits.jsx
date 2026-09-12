import React, { useEffect, useState } from 'react'
import { dummyPlans } from '../assets/assets'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Credits = () => {
  const [plans, setplans] = useState([])
  const [loading, setloading] = useState(true)
  const { axios, token, user } = useAppContext()

  const fetchData = async () => {
    try {
      const { data } = await axios.get("/api/credit/plan")
      if (data.success && data.plans && data.plans.length > 0) {
        setplans(data.plans)
      } else {
        setplans(dummyPlans)
      }
    } catch (error) {
      setplans(dummyPlans)
    } finally {
      setloading(false)
    }
  }

  const handlePurchase = async (planId) => {
    try {
      if (!user) return toast.error("Please login to purchase credits")
      const { data } = await axios.post(
        "/api/credit/purchase",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Could not initiate payment")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <Loading />

  return (
    <main className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h1 className='text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white'>Credit Plans</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${
              plan._id === "pro"
                ? "bg-purple-50 dark:bg-purple-900"
                : "bg-white dark:bg-transparent"
            }`}
          >
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h2>

              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">
                ${plan.price}
                <span className="text-base font-normal text-gray-600 dark:text-purple-200">
                  {' '} / {plan.credits} credits
                </span>
              </p>

              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handlePurchase(plan._id)}
              aria-label={`Buy ${plan.name} plan with ${plan.credits} credits for $${plan.price}`}
              className="mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Credits
