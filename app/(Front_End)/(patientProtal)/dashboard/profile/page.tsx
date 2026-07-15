import React from 'react'
import ProfileClient from './ProfileClient'
import { getPatientProfile } from '@/app/(Front_End)/actions/patient'

export default async function Profile() {
  const patient = await getPatientProfile();
  return (
    <ProfileClient initialData={patient} />
  )
}
