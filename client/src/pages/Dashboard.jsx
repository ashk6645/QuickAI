import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import { SkeletonCard, SkeletonCreationItem } from '../components/LoadingComponents'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth()

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getDashboardData()
  }, [])
  
  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-8'>
        {/* Total Creation Card */}
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Creations</p>
                <h2 className='text-2xl font-semibold text-gray-900'>{creations.length}</h2>
              </div>
              <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
            </div>

            {/* Active Plan Card*/}
            <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Active Plan</p>
                <h2 className='text-2xl font-semibold text-gray-900'>
                  <Protect plan='premium' fallback="Free">Premium</Protect>
                </h2>
              </div>
              <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                <Gem className='w-6 h-6 text-white' />
              </div>
            </div>
          </>
        )}
      </div>

      <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>Recent Creations</h3>
        
        {loading ? (
          <div className='h-[400px] space-y-4'>
            <SkeletonCreationItem />
            <SkeletonCreationItem />
            <SkeletonCreationItem />
          </div>
        ) : (
          <div className='h-[400px] space-y-4'>
            {creations.length > 0 ? (
                <div className="h-[400px] overflow-scroll space-y-4" >
                  {creations.map((item) => (
                    <CreationItem key={item.id} item={item} />
                    ))}
                </div>
            ) : (
              <div className='text-center py-10 text-gray-500'>
                <Sparkles className='w-12 h-12 mx-auto text-gray-300 mb-3' />
                <p>No creations yet. Start creating with our AI tools!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard