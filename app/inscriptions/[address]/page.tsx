import getQueryClient from '@services/reactquery/getQueryClient'
import { getRecommendedFeeRates, queryOrdinalsByAddress } from '@services/rest/api'
import { Hydrate, dehydrate } from '@tanstack/react-query'

import OrdinalsClientPage from './client-page'

export default async function Hydation({
  params,
  searchParams
}: {
  params: { address: string }
  searchParams: { [key: string]: string | undefined }
}) {
  const { address } = params

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['queryOrdinalsByAddress', address],
    queryFn: () => queryOrdinalsByAddress(address)
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <OrdinalsClientPage params={params} searchParams={searchParams} />
    </Hydrate>
  )
}
