import getQueryClient from '@services/reactquery/getQueryClient'
import { getRecommendedFeeRates } from '@services/rest/api'
import { Hydrate, dehydrate } from '@tanstack/react-query'

import InscribeClientPage from './client-page'

export default async function Hydation() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(['recommendedFeeRates'], getRecommendedFeeRates)
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <InscribeClientPage />
    </Hydrate>
  )
}
